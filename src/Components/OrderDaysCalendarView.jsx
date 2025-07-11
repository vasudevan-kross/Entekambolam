import React, { useEffect, useState } from "react";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // Main style file
import "react-date-range/dist/theme/default.css"; // Default theme
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

function OrderDaysCalendarView({ orderDayModel }) {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [subType, setSubType] = useState();
  const [dayCodes, setDayCode] = useState([]);
  const [pauseDates, setPauseDates] = useState([]);
  const [resumeDates, setResumeDates] = useState([]);
  const [selectionRange, setSelectionRange] = useState();
  const [deliveryDateList, setDeliveryDateList] = useState([]);

  useEffect(() => {
    var daycodeJsone = [];
    var pauseDateList = [];
    var resumeDateList = [];
    var totalDayDifference = 0;
    const parsedStartDate = dayjs(orderDayModel.startDate).isValid()
      ? dayjs(orderDayModel.startDate).toDate()
      : null;
    setDeliveryDateList(orderDayModel.deliveryDateList);
    setStartDate(parsedStartDate);
    setSubType(orderDayModel.subscriptionType);
    if (orderDayModel.subscriptionType == 2) {
      const validJsonString = orderDayModel.weekDayCode.replace(/(\w+):/g, '"$1":');
      daycodeJsone = JSON.parse(validJsonString);
      setDayCode(daycodeJsone);
    }
    if (orderDayModel.pauseDates && orderDayModel.resumeDates) {
      pauseDateList = JSON.parse(
        orderDayModel.pauseDates.replace(/^\[/, '["').replace(/\]$/, '"]').replace(/, /g, '", "'))
        .map((date) => dayjs(date)).filter((date) => date.isValid());
      resumeDateList = JSON.parse(
        orderDayModel.resumeDates.replace(/^\[/, '["').replace(/\]$/, '"]').replace(/, /g, '", "'))
        .map((date) => dayjs(date)).filter((date) => date.isValid());
      setPauseDates(pauseDateList);
      setResumeDates(resumeDateList);
      totalDayDifference = pauseDateList.reduce((total, pauseDate, index) => {
        const resumeDate = resumeDateList[index];
        if (!resumeDate) {
          return total;
        }
        const dayDifference = calculateDateDifference(pauseDate, resumeDate, orderDayModel.subscriptionType, daycodeJsone);
        return total + dayDifference;
      }, 0);
    }

    const endDate = calculateEndDate(orderDayModel.startDate, daycodeJsone, totalDayDifference);
    setEndDate(endDate);
    setSelectionRange({
      startDate: parsedStartDate,
      endDate: endDate,
      key: "selection",
    });

  }, [orderDayModel]);

  const calculateDateDifference = (pauseDate, resumeDate, subType, dayCodes = []) => {
    const start = new Date(pauseDate);
    const end = new Date(resumeDate);
    if (isNaN(start) || isNaN(end)) return 0;
    let countDays = 0;
    const diffTime = end - start;
    const diffDays = diffTime / (1000 * 3600 * 24);
    const isAlternateDay = Math.floor(diffDays) % 2 === 0;
    if (subType === 2) {
      const tempDate = new Date(start);
      while (tempDate <= end) {
        const currentDayCode = tempDate.getDay();
        const dayExists = dayCodes.some(day => day.dayCode === currentDayCode);
        const isDeliveryDate = orderDayModel?.deliveryDateList?.some(deliveryDate => {
          return dayjs(tempDate).isSame(dayjs(deliveryDate), "day");
        });
        if (dayExists && !isDeliveryDate) {
          countDays++;
        }
        tempDate.setDate(tempDate.getDate() + 1);
      }
      return countDays;
    }
    if (subType === 4 && isAlternateDay) {
      return diffDays;
    }

    return diffDays + 1;
  };

  const calculateEndDate = (startDate, dayCodes, totalDayDifference = 0) => {
    let daysDifference = 0;
    if (orderDayModel.pauseDates && orderDayModel.resumeDates) {
      daysDifference = totalDayDifference;
    }

    let endDate;
    if (orderDayModel.subscriptionType === 2) {
      var weekdayCount = 0;
      var tempCurrentDate = new Date(startDate);
      while (weekdayCount < 6) {
        tempCurrentDate.setDate(tempCurrentDate.getDate() + 1);
        const currentDay = tempCurrentDate.getDay();
        const dayExists = dayCodes.some(day => day.dayCode === (currentDay));
        if (dayExists) {
          weekdayCount++;
        }
      }
      if (daysDifference > 0) {
        let additionalDatesAdded = 0;
        while (additionalDatesAdded < daysDifference) {
          tempCurrentDate.setDate(tempCurrentDate.getDate() + 1);
          const currentDayCode = tempCurrentDate.getDay();
          const dayExists = dayCodes.some(day => day.dayCode === currentDayCode);

          if (dayExists) {
            additionalDatesAdded++;
          }
        }
      }
      endDate = new Date(tempCurrentDate);
    }
    else if (orderDayModel.subscriptionType === 3) {
      const monthDays = daysDifference > 0 ? 29 + daysDifference : 29;
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + monthDays);
    }
    else if (orderDayModel.subscriptionType === 4) {
      const alternateDays = daysDifference > 0 ? 29 + daysDifference : 29;
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + alternateDays);
    }
    return endDate;
  };


  const renderDayContent = (date) => {
    const day = dayjs(date);
    const dayCode = day.day();

    const isInPausePeriod = pauseDates.some((pauseDate, index) => {
      const resumeDate = resumeDates[index];
      if (!resumeDate) {
        return false;
      }
      const pauseStart = dayjs(pauseDate);
      const pauseEnd = dayjs(resumeDate);
      return pauseStart.isValid() && pauseEnd.isValid() && day.isBetween(pauseStart, pauseEnd, null, "[]");
    });

    const isInRange = day.isBetween(startDate, endDate, null, "[]");

    const isDeliveryDate = deliveryDateList.some(deliveryDate => {
      return day.isSame(dayjs(deliveryDate), "day");
    });

    let backgroundColor = "";
    let textColor = "";
    if (subType === 2 && dayCodes.length > 0 && isInRange) {
      const dayExists = dayCodes.some(day => day.dayCode === dayCode);
      if (dayExists && isDeliveryDate) {
        backgroundColor = "green";
        textColor = "white";
      } else if (dayExists && isInPausePeriod) {
        backgroundColor = "red";
        textColor = "white";
      }
      else if (dayExists) {
        backgroundColor = "blue";
        textColor = "white";
      } else {
        backgroundColor = "white";
        textColor = "black";
      }
    }
    else if (subType === 3 && isInRange) {
      if (isDeliveryDate) {
        backgroundColor = "green";
        textColor = "white";
      } else if (isInPausePeriod) {
        backgroundColor = "red";
        textColor = "white";
      } else {
        backgroundColor = "blue";
        textColor = "white";
      }
    }
    else if (subType === 4 && isInRange) {
      const isAlternateDay = day.diff(startDate, "days") % 2 === 0;
      if (isDeliveryDate && isAlternateDay) {
        backgroundColor = "green";
        textColor = "white";
      } else if (isAlternateDay && isInPausePeriod) {
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
        }}
      >
        {day.date()}
      </div>
    );
  };

  if (!startDate || !endDate) {
    return <div>Loading...</div>;
  }

  return (
    // style to remove the defauld selections UI
    <>
      <style>
        {`
      .rdrDays{
      row-gap:0.75rem}
      .rdrDayStartPreview, .rdrDayEndPreview, .rdrDayInPreview{
      border: none !important;
      }
        .rdrSelected,
        .rdrInRange {
          background-color: transparent !important;
          box-shadow: none !important;
        }
        .rdrStartEdge,
        .rdrEndEdge {
          display: none !important;
        }
        .rdrDateRangePickerWrapper .rdrCalendarWrapper .rdrDay:hover {
          background-color: transparent !important;
          color: inherit !important;
          border: none !important;  /* Remove border */
          outline: none !important; /* Remove outline */
        }
        .rdrDefinedRangesWrapper {
          display: none !important;
        }
       .rdrDateRangePickerWrapper .rdrCalendarWrapper .rdrInRange:hover {
          background-color: transparent !important;
          color: inherit !important;
          border: none !important;  /* Remove border */
          outline: none !important; /* Remove outline */
        }
      `}
      </style>
      <DateRangePicker
        ranges={selectionRange ? [selectionRange] : []}
        onChange={() => { }}
        dayContentRenderer={renderDayContent}
        minDate={startDate}
        maxDate={endDate}
        staticRanges={[]}
        inputRanges={[]}
      />
    </>
  );
};

export default OrderDaysCalendarView;