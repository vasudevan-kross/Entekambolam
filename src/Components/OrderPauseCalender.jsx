import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { Button } from "@mui/material";

dayjs.extend(isBetween);

function PauseCalendar({
  orderModel,
  handlePauseOrder,
  loading,
  isAllowSelect = true,
}) {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [actualEndate, setActualEndDate] = useState();
  const [subType, setSubType] = useState();
  const [dayCodes, setDayCode] = useState([]);
  const [pauseDates, setPauseDates] = useState([]);
  const [newEndDate, setNewEndDate] = useState();

  useEffect(() => {
    const parsedStartDate = dayjs(orderModel.start_date).isValid()
      ? dayjs(orderModel.start_date).toDate()
      : null;
    setStartDate(parsedStartDate);

    const originalEndDate = calculateEndDate(parsedStartDate);
    setEndDate(originalEndDate);

    const originalEndDateWithoutPauseDate =
      calculateEndDateWithoutPauseDate(parsedStartDate);
    setActualEndDate(originalEndDateWithoutPauseDate);
    setSubType(orderModel?.subscription_type);

    if (orderModel.subscription_type === 2) {
      const validJsonString = orderModel.selected_days_for_weekly?.replace(
        /(\w+):/g,
        '"$1":'
      );
      const dayCodeJson = JSON.parse(validJsonString);
      setDayCode(dayCodeJson);
    }
    if (orderModel.pause_dates) {
      try {
        // Ensure that pause_dates is in the correct format
        const sanitizedPauseDates = orderModel.pause_dates.trim();

        // Add double quotes around the dates if they are missing
        const correctedPauseDates = sanitizedPauseDates.replace(
          /(\d{4}-\d{2}-\d{2})(?=,|\]|\s|$)/g,
          '"$1"'
        ); // Add quotes around each date

        // Now parse the corrected string as a JSON array
        const pauseDateList = JSON.parse(correctedPauseDates)
          .map((date) => dayjs(date)) // Convert the dates to dayjs objects
          .filter((date) => date.isValid()); // Filter out invalid dates

        setPauseDates(pauseDateList);
      } catch (error) {
        console.error("Error parsing pause_dates:", error);
      }
    }
  }, [orderModel]);

  const calculateEndDate = (startDate) => {
    if (!orderModel || !orderModel.subscription_type) {
      return dayjs(startDate).add(180, "day").toDate();
    }

    let daysDifference = 0;
    if (
      orderModel.pause_dates &&
      orderModel.pause_dates.split(",").length > 0
    ) {
      daysDifference = orderModel.pause_dates.split(",").length;
    }

    switch (orderModel.subscription_type) {
      case 2: {
        let weekdayCount = 0;
        let tempStartDate = dayjs(startDate);

        while (weekdayCount < 7) {
          // <-- CHANGED from 6 to 7
          if (
            checkExistSelectedDay(
              tempStartDate.day(),
              orderModel.selected_days_for_weekly
            )
          ) {
            weekdayCount++;
          }
          if (weekdayCount < 7) {
            tempStartDate = tempStartDate.add(1, "day");
          }
        }

        if (daysDifference > 0) {
          let additionalDatesAdded = 0;
          while (additionalDatesAdded < daysDifference) {
            tempStartDate = tempStartDate.add(1, "day");
            const dayCode = tempStartDate.day();

            if (
              checkExistSelectedDay(
                dayCode,
                orderModel.selected_days_for_weekly
              )
            ) {
              additionalDatesAdded++;
            }
          }
        }

        return tempStartDate.toDate();
      }

      case 3: {
        const monthDays = 29 + daysDifference;
        return dayjs(startDate).add(monthDays, "day").toDate();
      }

      case 4: {
        const alternateDays = 28 + daysDifference * 2;
        return dayjs(startDate).add(alternateDays, "day").toDate();
      }

      default: {
        return dayjs(startDate).add(180, "day").toDate();
      }
    }
  };

  const calculateEndDateWithoutPauseDate = (startDate) => {
    if (!orderModel || !orderModel.subscription_type) {
      return dayjs(startDate).add(180, "day").toDate();
    }

    switch (orderModel.subscription_type) {
      case 2: {
        let weekdayCount = 0;
        let tempStartDate = dayjs(startDate);

        while (weekdayCount < 7) {
          if (
            checkExistSelectedDay(
              tempStartDate.day(),
              orderModel.selected_days_for_weekly
            )
          ) {
            weekdayCount++;
          }
          if (weekdayCount < 7) {
            tempStartDate = tempStartDate.add(1, "day");
          }
        }

        return tempStartDate.toDate();
      }

      case 3: {
        return dayjs(startDate).add(29, "day").toDate();
      }

      case 4: {
        return dayjs(startDate).add(28, "day").toDate();
      }

      default: {
        return dayjs(startDate).add(180, "day").toDate();
      }
    }
  };

  const calculateNewEndDate = (selectedDates) => {
    const additionalDays = selectedDates.length;

    if (orderModel?.subscription_type === 2) {
      let tempEndDate = dayjs(actualEndate);
      let addedDays = 0;

      while (addedDays < additionalDays) {
        tempEndDate = tempEndDate.add(1, "day");
        const dayCode = tempEndDate.day();

        if (
          checkExistSelectedDay(dayCode, orderModel.selected_days_for_weekly)
        ) {
          addedDays++;
        }
      }

      return tempEndDate.toDate();
    }

    if (orderModel?.subscription_type === 3) {
      return dayjs(actualEndate).add(additionalDays, "day").toDate();
    }

    if (orderModel?.subscription_type === 4) {
      let tempEndDate = dayjs(actualEndate);
      let addedDays = 0;

      while (addedDays < additionalDays) {
        tempEndDate = tempEndDate.add(1, "day");
        const diffDays = tempEndDate.diff(dayjs(startDate), "days");
        if (diffDays % 2 === 0) {
          addedDays++;
        }
      }

      return tempEndDate.toDate();
    }

    return dayjs(actualEndate).add(additionalDays, "day").toDate();
  };

  // const checkExistSelectedDayw = (dayCode, selectedValueDays) => {
  //   const validJsonString = selectedValueDays?.replace(/(\w+):/g, '"$1":');
  //   const dayCodeJson = JSON.parse(validJsonString);
  //   if (!dayCodeJson || dayCodeJson.length === 0) return false;

  //   const dayCheckCode = dayCode === 0 ? 7 : dayCode;
  //   return dayCodeJson.some((day) => day.dayCode === dayCheckCode);
  // };

  const checkExistSelectedDay = (dayCode, selectedValueDays) => {
    const validJsonString = selectedValueDays?.replace(/(\w+):/g, '"$1":');
    const dayCodeJson = JSON.parse(validJsonString);
    if (!dayCodeJson || dayCodeJson.length === 0) return false;

    // REMOVE this normalization:
    // const dayCheckCode = dayCode === 0 ? 7 : dayCode;
    return dayCodeJson.some((day) => day.dayCode === dayCode);
  };

  const renderTile = ({ date, view }) => {
    const day = dayjs(date);
    const dayCode = day.day();

    const isInPausePeriod = pauseDates.some((pauseDate) => {
      const pauseStart = dayjs(pauseDate);
      return pauseStart.isValid() && day.isSame(pauseStart);
    });
    const updateEndate = newEndDate || endDate;
    const isInRange = day.isBetween(
      dayjs(startDate),
      dayjs(updateEndate),
      null,
      "[]"
    );

    const isDeliveryDate = orderModel?.deliveryDates?.some((deliveryDate) => {
      return dayjs(day).isSame(dayjs(deliveryDate), "day");
    });
    let isDisabled = false;

    if (subType === 2 && dayCodes.length > 0) {
      const isDeliveryDay = dayCodes.some(
        (dayObj) => dayObj.dayCode === dayCode
      );
      if (!isDeliveryDay || !isInRange) {
        isDisabled = true;
      }
    }

    if (subType === 4) {
      const isAlternateDay = day.diff(dayjs(startDate), "days") % 2 === 0;
      if (!isAlternateDay || !isInRange) {
        isDisabled = true;
      }
    }

    let backgroundColor = "";
    let textColor = "";

    if (isDeliveryDate) {
      backgroundColor = "green";
      textColor = "white";
    } else if (subType === 2 && dayCodes.length > 0 && isInRange) {
      const dayExists = dayCodes.some((dayObj) => dayObj.dayCode === dayCode);
      if (dayExists && isInPausePeriod) {
        backgroundColor = "red";
        textColor = "white";
      } else if (dayExists) {
        backgroundColor = "blue";
        textColor = "white";
      } else {
        backgroundColor = "white";
        textColor = "black";
      }
    } else if (subType === 3 && isInRange) {
      if (isInPausePeriod) {
        backgroundColor = "red";
        textColor = "white";
      } else {
        backgroundColor = "blue";
        textColor = "white";
      }
    } else if (subType === 4 && isInRange) {
      const isAlternateDay = day.diff(dayjs(startDate), "days") % 2 === 0;
      if (isAlternateDay && isInPausePeriod) {
        backgroundColor = "red";
        textColor = "white";
      } else if (isAlternateDay) {
        backgroundColor = "blue";
        textColor = "white";
      } else {
        backgroundColor = "white";
        textColor = "black";
      }
    }

    const disabledStyle = isDisabled
      ? { backgroundColor: "#e0e0e0", color: "#b0b0b0", cursor: "not-allowed" }
      : {};

    return (
      <div
        style={{
          backgroundColor,
          color: textColor,
          padding: "5px",
          borderRadius: "50%",
          width: "35px",
          height: "35px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...disabledStyle,
        }}
        onClick={(e) => {
          if (isDisabled) {
            e.preventDefault();
          }
        }}
      >
        {day.date()}
      </div>
    );
  };

  if (!startDate || !endDate) {
    return <div>Loading...</div>;
  }

  const handleSelect = (value) => {
    if (!isAllowSelect) {
      return;
    }
    const selectedDay = dayjs(value).startOf("day");
    let isDisabled = false;
    const updateEndate = newEndDate || endDate;
    const isDeliveryDate = orderModel?.deliveryDates?.some((deliveryDate) => {
      return dayjs(selectedDay).isSame(dayjs(deliveryDate), "day");
    });
    if (isDeliveryDate) {
      return;
    }
    if (subType === 2 && dayCodes.length > 0) {
      const dayCode = selectedDay.day();
      const isDeliveryDay = dayCodes.some(
        (dayObj) => dayObj.dayCode === dayCode
      );
      if (
        !isDeliveryDay ||
        !selectedDay.isBetween(
          dayjs(startDate),
          dayjs(updateEndate),
          null,
          "[]"
        )
      ) {
        isDisabled = true;
      }
    }

    if (subType === 4) {
      const isAlternateDay =
        selectedDay.diff(dayjs(startDate), "days") % 2 === 0;
      if (
        !isAlternateDay ||
        !selectedDay.isBetween(
          dayjs(startDate),
          dayjs(updateEndate),
          null,
          "[]"
        )
      ) {
        isDisabled = true;
      }
    }

    if (isDisabled) {
      return;
    }

    const isPauseDateExist = pauseDates.some((pauseDate) =>
      pauseDate.isSame(selectedDay)
    );

    const newPauseDates = isPauseDateExist
      ? pauseDates.filter((pauseDate) => !pauseDate.isSame(selectedDay))
      : [...pauseDates, selectedDay];

    setPauseDates(newPauseDates);
    const calculatedDate = calculateNewEndDate(newPauseDates);
    setNewEndDate(calculatedDate);
  };

  const handleSave = () => {
    const formattedPauseDates = pauseDates.map((date) =>
      date.format("YYYY-MM-DD")
    );
    const updatedPauseDates = formattedPauseDates.join(",");
    handlePauseOrder(updatedPauseDates);
  };

  return (
    <div>
      <style>
        {`
        .react-calendar__tile{
          background:white;
  color: white;
        }
      .react-calendar__tile--active {
  background:white;
  color: white;
}
  .react-calendar__tile--active:enabled:hover,
.react-calendar__tile--active:enabled:focus {
  background:white;
}
`}
      </style>
      <Calendar
        tileContent={renderTile}
        minDate={startDate}
        maxDate={newEndDate || endDate}
        selectRange={false}
        showNeighboringMonth={false}
        onChange={handleSelect}
      />
      {isAllowSelect && (
        <>
          <div style={{ marginTop: "20px" }}>
            <p>Pause Dates Count: {pauseDates.length}</p>
            {newEndDate && (
              <p>
                End Date: {dayjs(newEndDate || endDate).format("MMMM D, YYYY")}
              </p>
            )}
          </div>

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={handleSave}
              disabled={loading}
              style={{
                padding: "10px 20px",
                backgroundColor: "green",
                color: "white",
              }}
            >
              Save
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default PauseCalendar;
