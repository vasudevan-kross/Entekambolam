import dayjs from "dayjs";

const Utils = {
  getDayName(dateString) {
    const date = new Date(dateString);
    const options = { weekday: "long" };
    const day = date.toLocaleDateString(undefined, options);
    switch (day) {
      case "Sunday":
        return 0;
      case "Monday":
        return 1;
      case "Tuesday":
        return 2;
      case "Wednesday":
        return 3;
      case "Thursday":
        return 4;
      case "Friday":
        return 5;
      case "Saturday":
        return 6;
      default:
        return null;
    }
  },

  // Helper function to get subscription type
  getSubscriptionType(type) {
    switch (type) {
      case 1:
        return "One Time Order";
      case 2:
        return "Weekly";
      case 3:
        return "Monthly";
      case 4:
        return "Alternative Days";
      default:
        return "N/A";
    }
  },

  getOrderType(type) {
    switch (type) {
      case 1:
        return "Prepaid";
      case 2:
        return "Postpaid";
      case 3:
        return "Paynow";
      case 4:
        return "COD";
      default:
        return "N/A";
    }
  },

  getProfitLossDisplayWithColorCode(orderId, uniqueID, reportDatas) {
    // Filter records for the given orderId
    const orderRecords = reportDatas.filter((t) => t.order_number === orderId);

    // Sort the records by a property that ensures proper order (if required)
    // Assuming `unique_id` is sequential, replace with another field if necessary
    orderRecords.sort((a, b) => a.unique_id.localeCompare(b.unique_id));

    let totalRefund = 0; // Initialize the cumulative refund tracker
    let remainingOrderAmount = 0; // Initialize remaining order amount

    // Iterate over records and calculate balance dynamically
    for (let record of orderRecords) {
      if (record.unique_id === uniqueID) {
        // When the current record matches the uniqueID, calculate and return
        const orderAmount = parseFloat(record.order_amount);
        const refundAmount = parseFloat(record.refund_amount) || 0;

        if (remainingOrderAmount === 0) {
          // Use the initial order amount if it's the first record
          remainingOrderAmount = orderAmount;
        }

        totalRefund += refundAmount; // Update cumulative refund
        remainingOrderAmount -= refundAmount; // Deduct refund from remaining order amount

        const profitLoss = remainingOrderAmount;
        const color =
          profitLoss > 0 ? "green" : profitLoss < 0 ? "red" : "black";

        return {
          text:
            profitLoss > 0
              ? `+${profitLoss.toFixed(2)}`
              : profitLoss < 0
              ? profitLoss.toFixed(2)
              : "0.00",
          color,
        };
      } else {
        // For non-matching records, update the refund and remaining amount
        totalRefund += parseFloat(record.refund_amount) || 0;

        if (remainingOrderAmount === 0) {
          remainingOrderAmount = parseFloat(record.order_amount) || 0;
        }

        remainingOrderAmount -= parseFloat(record.refund_amount) || 0;
      }
    }

    return { text: "Record Not Found", color: "black" };
  },

  // Utility function for calculating the final order amount with refund as negative
  calculateOrderAmount(orderAmountValue, refundAmountValue) {
    const orderAmount = parseFloat(orderAmountValue);
    const refundAmount = refundAmountValue ? parseFloat(refundAmountValue) : 0;

    if (isNaN(orderAmount)) {
      return null; // Return null to signify an invalid order amount
    }

    let total = refundAmount === 0 ? orderAmount : -Math.abs(refundAmount);
    return total.toFixed(2);
  },

  getProfitLossDisplay(orderId, uniqueID, reportDatas) {
    // Filter records for the given orderId
    const orderRecords = reportDatas.filter((t) => t.order_number === orderId);

    // Sort the records by a property that ensures proper order (if required)
    // Assuming `unique_id` is sequential, replace with another field if necessary
    orderRecords.sort((a, b) => a.unique_id.localeCompare(b.unique_id));

    let totalRefund = 0; // Initialize the cumulative refund tracker
    let remainingOrderAmount = 0; // Initialize remaining order amount

    // Iterate over records and calculate balance dynamically
    for (let record of orderRecords) {
      if (record.unique_id === uniqueID) {
        // When the current record matches the uniqueID, calculate and return
        const orderAmount = parseFloat(record.order_amount);
        const refundAmount = parseFloat(record.refund_amount) || 0;

        if (remainingOrderAmount === 0) {
          // Use the initial order amount if it's the first record
          remainingOrderAmount = orderAmount;
        }

        totalRefund += refundAmount; // Update cumulative refund
        remainingOrderAmount -= refundAmount; // Deduct refund from remaining order amount

        const profitLoss = remainingOrderAmount;

        return profitLoss > 0
          ? `+${profitLoss.toFixed(2)}`
          : profitLoss < 0
          ? profitLoss.toFixed(2)
          : "0.00"; // Return the calculated amount as a string
      } else {
        // For non-matching records, update the refund and remaining amount
        totalRefund += parseFloat(record.refund_amount) || 0;

        if (remainingOrderAmount === 0) {
          remainingOrderAmount = parseFloat(record.order_amount) || 0;
        }

        remainingOrderAmount -= parseFloat(record.refund_amount) || 0;
      }
    }

    return "Record Not Found";
  },

  // Utility function to format the address
  formatAddress(addressFields) {
    const { flat_no, apartment_name, area, landmark, city, pincode } =
      addressFields;

    // Use an array to store address parts
    const addressParts = [
      flat_no,
      apartment_name,
      area,
      landmark,
      city,
      pincode ? `- ${pincode}` : null, // Add " - " only if pincode exists
    ];

    // Use reduce to join non-empty parts, ensuring no extra commas
    return addressParts.reduce((acc, part, index) => {
      if (!part) return acc; // Skip if part is empty

      // For the last part (pincode), ensure it starts with a space without a trailing comma
      if (index === addressParts.length - 1 && pincode) {
        return `${acc} ${part}`;
      }

      // Otherwise, add part with a comma
      return acc ? `${acc}, ${part}` : part;
    }, "");
  },

  getBase64FromImage(url, callback) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      callback(dataURL);
    };
  },

  getUserData() {
    const adminData = sessionStorage.getItem("admin");
    const driverData = sessionStorage.getItem("driver");

    const userSessionData = adminData
      ? JSON.parse(adminData)
      : driverData
      ? JSON.parse(driverData)
      : null;
    return userSessionData;
  },

  formatDateToDDMMYYYY(date) {
    const day = String(date.getDate()).padStart(2, "0"); // Add leading zero if needed
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  },

  getDateRange() {
    const toDate = new Date(); // Current date
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - 7); // 7 days ago

    return {
      toDate: this.formatDateToDDMMYYYY(toDate),
      fromDate: this.formatDateToDDMMYYYY(fromDate),
    };
  },

  getUpdatedTotalQuantity(qty, subscriptionType) {
    switch (subscriptionType) {
      case 1:
        return qty * 1; // Case 1: qty * 1
      case 2:
        return qty; // Case 2: qty remains unchanged
      case 3:
        return qty * 30; // Case 3: qty * 30
      case 4:
        return qty * 15; // Case 4: qty * 15
      default:
        return qty; // Default: qty remains unchanged
    }
  },

  isDateToday(date) {
    const today = dayjs().startOf("day"); // Start of today
    const assignedDate = dayjs(date).startOf("day"); // Start of the assigned date
    return assignedDate.isSame(today);
  },

  salesAmount(
    orderAmountValue,
    refundAmountValue,
    qty,
    price,
    tax,
    subscriptionType,
    deliveryCharge
  ) {
    if (refundAmountValue) {
      const refundAmount = parseFloat(refundAmountValue) || 0;
      return (-Math.abs(refundAmount)).toFixed(2);
    }

    if (subscriptionType === null || subscriptionType === 1) {
      return (parseFloat(orderAmountValue) || 0).toFixed(2);
    } else {
      const taxPrice = (price * tax) / 100;
      const orderAmount = (price + taxPrice) * qty + deliveryCharge;
      return orderAmount.toFixed(2);
    }
  },

  getUpdatedQuantity(
    qty,
    subscriptionType,
    selectedDate,
    selectedDaysWeekly = []
  ) {
    switch (subscriptionType) {
      case 2: // Weekly
        qty = this.getQtyForSelectedDay(selectedDaysWeekly, selectedDate);
        return qty;

      case 1: // One-time
      case 3: // Monthly
      case 4: // Alternate Days
      default:
        return qty;
    }
  },

  getQtyForSelectedDay(selectedDaysArray, selectedDate) {
    if (typeof selectedDaysArray === "string") {
      const fixedJson = selectedDaysArray.replace(/(\w+):/g, '"$1":');
      try {
        selectedDaysArray = JSON.parse(fixedJson);
      } catch (e) {
        console.error("Invalid JSON string passed to getQtyForSelectedDay");
        return 0;
      }
    }

    const dayQtyMap = {};
    selectedDaysArray.forEach((day) => {
      const code = day.dayCode === 0 ? 7 : day.dayCode; // Normalize Sunday to 7
      dayQtyMap[code] = day.qty;
    });

    const jsDay = selectedDate.getDay();
    const code = jsDay === 0 ? 7 : jsDay;

    return dayQtyMap[code] || 0;
  },

  renderSubscriptionStatusCell(params) {
    const orderStatus = params.row.status; // 1 = Confirmed, 0 = Pending, 2 = Canceled
    const endDate = params.row.end_date
      ? dayjs(params.row.end_date, "DD-MM-YYYY").utc().local().startOf("day")
      : null;
    const today = dayjs().startOf("day");

    let alertMsg = "--";
    let color = "gray";

    if (orderStatus !== 1) {
      alertMsg = "Inactive";
      color = "gray";
    } else if (endDate) {
      const diffDays = endDate.diff(today, "day");

      if (diffDays === 0) {
        alertMsg = "Ends Today";
        color = "red";
      } else if (diffDays < 0) {
        alertMsg = "Ended";
        color = "red";
      } else if (diffDays <= 2) {
        alertMsg = "Ending Soon";
        color = "orange";
      } else {
        alertMsg = "Active";
        color = "green";
      }
    }

    return (
      <span
        style={{
          color: color,
          fontWeight: "bold",
          fontSize: "12px",
        }}
      >
        {alertMsg}
      </span>
    );
  },

  getSubscriptionAlert(row) {
    const orderStatus = row.status;
    const endDate = row.end_date
      ? dayjs(row.end_date).utc().local().startOf("day")
      : null;
    const today = dayjs().startOf("day");

    if (orderStatus !== 1) return "Inactive";
    if (!endDate) return "--";

    const diffDays = endDate.diff(today, "day");

    if (diffDays === 0) return "Ends Today";
    if (diffDays < 0) return "Ended";
    if (diffDays <= 2) return "Ending Soon";

    return "Active";
  },
};

export default Utils;
