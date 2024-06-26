import axios from "axios";
import moment from "moment-timezone";

import { capitolizeFirstChar } from "../../componentFunctions";

export const accountFilter = (
  account,
  activeAnalyticsSocialType,
  postingTypes
) =>
  account.socialType === postingTypes[activeAnalyticsSocialType].name &&
  !(account.socialType === "facebook" && account.accountType === "profile");

export const calculateTotalPostPositiveReactions = postAnalyticsObjects => {
  let sumOfPostReactions = 0;

  for (let index in postAnalyticsObjects) {
    const postAnalyticsObject = postAnalyticsObjects[index];

    if (postAnalyticsObject.analytics) {
      for (let index2 in postAnalyticsObject.analytics) {
        const analytic = postAnalyticsObject.analytics[index2];
        if (
          analytic.title === "Lifetime Total Like Reactions of a post." ||
          analytic.title === "Lifetime Total Love Reactions of a post." ||
          analytic.title === "Lifetime Total wow Reactions of a post."
        ) {
          sumOfPostReactions +=
            analytic.lifetimeValues[analytic.lifetimeValues.length - 1].value[0]
              .value;
        }
      }
    }
  }
  return sumOfPostReactions;
};

export const getAnalytic = (
  activeAnalyticsSocialType,
  analyticBoxValue,
  analyticObject
) => {
  if (!analyticObject) return;
  const analyticTitleString = getAnalyticTitle(
    activeAnalyticsSocialType,
    analyticBoxValue
  );
  return findAnalytic(analyticObject, analyticTitleString);
};

export const getAccountAnalytics = (account, callback) => {
  axios.get("/api/analytics/" + account.socialID).then(res => {
    const { message, pageAnalyticsObject, success } = res.data;
    if (!success) callback(false);
    else {
      callback(pageAnalyticsObject);
    }
  });
};

export const getBox1Value = (
  activeAnalyticsSocialType,
  activePageAnalyticsObj
) => {
  let box1Value = 0;
  let box1Text = "";

  if (activeAnalyticsSocialType === 0) {
    box1Text = "New Visitors";
    box1Value = getLatestAnalyticValue(
      activeAnalyticsSocialType,
      activePageAnalyticsObj,
      0,
      true
    );
  } else if (activeAnalyticsSocialType === 3) {
    box1Text = "New Visitors";
    box1Value = getLatestAnalyticValue(
      activeAnalyticsSocialType,
      activePageAnalyticsObj,
      0,
      true
    );
  }

  return { box1Value, box1Text };
};

export const getBox2Value = (
  activeAnalyticsSocialType,
  activePageAnalyticsObj
) => {
  let box2Value = 0;
  let box2Text = "";

  if (activeAnalyticsSocialType === 0) {
    box2Text = "New Followers";
    box2Value = getLatestAnalyticValue(
      activeAnalyticsSocialType,
      activePageAnalyticsObj,
      1,
      true
    );
  } else if (activeAnalyticsSocialType === 3) {
    box2Text = "New Followers";
    box2Value = getLatestAnalyticValue(
      activeAnalyticsSocialType,
      activePageAnalyticsObj,
      1,
      true
    );
  }

  return { box2Value, box2Text };
};

export const getBox3Value = (
  activeAnalyticsSocialType,
  activePageAnalyticsObj
) => {
  let box3Value = 0;
  var box3Text = "";

  if (activeAnalyticsSocialType === 0) {
    box3Text = "Lifetime Total Likes";
    box3Value = getLatestAnalyticValue(
      activeAnalyticsSocialType,
      activePageAnalyticsObj,
      3
    );
  } else if (activeAnalyticsSocialType === 3) {
    box3Text = "Impressions";
    box3Value = getLatestAnalyticValue(
      activeAnalyticsSocialType,
      activePageAnalyticsObj,
      3,
      true
    );
  }

  return { box3Text, box3Value };
};

export const getPostAnalytics = callback => {
  axios.get("/api/analytics/posts").then(res => {
    const { postAnalyticsObjects, message, success } = res.data;

    if (success) callback({ postAnalyticsObjects });
    else {
      // todo handleerror
    }
  });
};

export const getDataLinesFromAnalytics = pageAnalyticsObj => {
  const analyticsInformationList = [];
  const dataPointArrays = [];

  if (pageAnalyticsObj) {
    if (pageAnalyticsObj) {
      for (let index in pageAnalyticsObj.analytics) {
        let dataPointArray = [];

        let areAnyDataPointsGreaterThanZero = false;
        if (!pageAnalyticsObj.analytics[index]) continue;
        const dailyValues = pageAnalyticsObj.analytics[index].dailyValues;

        for (let index2 in dailyValues) {
          const dailyValue = dailyValues[index2].dailyValue;

          if (dailyValue.length === 0) {
            dataPointArray.push({ data: 0 });
          } else if (dailyValue.length === 1) {
            if (dailyValue[0].value > 0) areAnyDataPointsGreaterThanZero = true;
            dataPointArray.push({
              data: dailyValue[0].value,
              date: new moment(dailyValue[0].date)
            });
          } else {
          }
        }

        if (areAnyDataPointsGreaterThanZero) {
          dataPointArrays.push(dataPointArray);
          analyticsInformationList.push({
            description: pageAnalyticsObj.analytics[index].description,
            title: pageAnalyticsObj.analytics[index].title
          });
        }
      }
    }
  }

  return { analyticsInformationList, dataPointArrays };
};

const getAnalyticTitle = (activeAnalyticsSocialType, analyticBoxValue) => {
  if (activeAnalyticsSocialType === 0) {
    if (analyticBoxValue === 0) return "Daily Page Engaged Users";
    else if (analyticBoxValue === 1)
      return "Daily New likes by paid and non-paid";
    else if (analyticBoxValue === 3) return "Lifetime Total Likes";
    else if (analyticBoxValue === 5) {
      return "Lifetime Likes by Country";
    }
  } else if (activeAnalyticsSocialType === 3) {
    if (analyticBoxValue === 0) return "Profile Views";
    else if (analyticBoxValue === 1) return "Reach";
    else if (analyticBoxValue === 3) return "Impressions";
  }
};

export const getLatestAnalyticValue = (
  activeAnalyticsSocialType,
  activePageAnalyticsObj,
  analyticBoxValue,
  sum
) => {
  if (activePageAnalyticsObj && activePageAnalyticsObj.analytics) {
    const analyticTitleString = getAnalyticTitle(
      activeAnalyticsSocialType,
      analyticBoxValue
    );
    const analytic = findAnalytic(activePageAnalyticsObj, analyticTitleString);

    if (analytic && !sum) return findLatestAnalyticValue(analytic);
    else if (analytic && sum) return sumLastThirtyDaysOfAnalytic(analytic);
  }
};

const findAnalytic = (analyticObject, analyticTitleString) => {
  return analyticObject.analytics.find(
    analytic => analytic.title === analyticTitleString
  );
};

const findLatestAnalyticValue = analytic => {
  const latestDailyData =
    analytic.dailyValues[analytic.dailyValues.length - 1].dailyValue;
  if (latestDailyData.length === 1) return latestDailyData[0].value;
  else {
    let dailySum = 0;
    for (let index in latestDailyData) {
      if (latestDailyData[index].key === "total")
        return latestDailyData[index].value;
      else dailySum += latestDailyData[index].value;
    }
    return dailySum;
  }
};

const sumLastThirtyDaysOfAnalytic = analytic => {
  const thirtyDaysAgoDate = new moment().subtract(30, "days");

  let analyticSum = 0;

  for (let index = 1; index <= 30; index++) {
    if (!analytic.dailyValues[analytic.dailyValues.length - index]) continue;
    const dateOfAnalytic = new moment(
      analytic.dailyValues[
        analytic.dailyValues.length - index
      ].dailyValue[0].date
    );

    if (
      dateOfAnalytic > thirtyDaysAgoDate &&
      analytic.dailyValues[analytic.dailyValues.length - index]
    ) {
      const latestDailyData =
        analytic.dailyValues[analytic.dailyValues.length - index].dailyValue;

      if (latestDailyData.length === 1) analyticSum += latestDailyData[0].value;
      else {
        let dailySum = 0;
        for (let index in latestDailyData) {
          if (latestDailyData[index].key === "total") {
            dailySum = latestDailyData[index].value;
            break;
          } else dailySum += latestDailyData[index].value;
        }
        analyticSum += dailySum;
      }
    }
  }
  return analyticSum;
};

export const calculateNumberOfYearsForGraphDropdown = analyticsObject => {
  let analyticsDropdownYears = [];
  if (analyticsObject) {
    let momentStart = new moment(analyticsObject.createdAt).subtract(
      3,
      "month"
    );
    let momentEnd = new moment();

    for (
      let index = Number(momentStart.format("YYYY"));
      index <= Number(momentEnd.format("YYYY"));
      index++
    ) {
      analyticsDropdownYears.push(index);
    }
  }
  return { analyticsDropdownYears };
};
const canDisplayMonth = (analyticsObject, month, year) => {
  if (analyticsObject) {
    const momentStart = new moment(analyticsObject.createdAt)
      .subtract(3, "month")
      .startOf("month");
    const momentEnd = new moment().endOf("month");

    const monthToTest = new moment().set({ year, month });

    if (monthToTest.isBetween(momentStart, momentEnd)) return true;
  }
  return false;
};

export const getCorrectMonthOfData = (
  activeGraphYear,
  activeGraphMonthIndex,
  graphType,
  line
) => {
  const dataPointsInMonth = [];
  const horizontalTitles = [];

  const lineStartDate = new moment()
    .set({
      year: activeGraphYear,
      month: activeGraphMonthIndex - 1
    })
    .endOf("month");

  const lineEndDate = new moment()
    .set({
      year: activeGraphYear,
      month: activeGraphMonthIndex + 1
    })
    .startOf("month");

  for (let index in line) {
    const dataPoint = line[index];

    if (new moment(dataPoint.date).isBetween(lineStartDate, lineEndDate)) {
      dataPointsInMonth.push(dataPoint.data);
      horizontalTitles.push(dataPoint.date);
    }
  }

  return { dataPointsInMonth, horizontalTitles };
};

export const getDropdownMonths = (analyticsObject, months, year) => {
  const temp = [];

  for (let index in months)
    if (canDisplayMonth(analyticsObject, months[index], year))
      temp.push(capitolizeFirstChar(months[index]));

  return temp;
};

export const makeAnalyticTitle = analyticInformation => {
  if (!analyticInformation) return undefined;
  const match = analyticInformation.description.match(/\((.*?)\)/);
  if (match)
    return (
      analyticInformation.title +
      " " +
      analyticInformation.description.match(/\((.*?)\)/)[0]
    );
  else return analyticInformation.title;
};
