import React, { useEffect, useState } from "react";
import { useQuery } from 'react-query';

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from "@mui/material/Switch";
import { alpha, styled } from '@mui/material/styles';

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsTreeChart from "highcharts/modules/treemap";
import HighchartsHeatmap from "highcharts/modules/heatmap";
import highcharts3d from "highcharts/highcharts-3d";
import sankey from "highcharts/modules/sankey.js";
import organization from "highcharts/modules/organization.js";

import GetAppIcon from "@mui/icons-material/GetApp";
import PersonIcon from '@mui/icons-material/Person';
import ProjectIcon from '@mui/icons-material/AppSettingsAlt';
import ToolIcon from '@mui/icons-material/Build';
import OverallScoreIcon from '@mui/icons-material/SportsScore';
import RunRulesIcon from '@mui/icons-material/Rule';

import { Card } from "react-bootstrap";
import { TextField, MenuItem, Grid, Typography, Container, Chip } from "@mui/material";
import "./report.css";
import axios from "../../services/AxiosOrder"
/* ES6 */
import * as htmlToImage from "html-to-image";
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination'
import TableSortLabel from '@mui/material/TableSortLabel';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { visuallyHidden } from '@mui/utils';
import { chunk, orderBy as lodashOrderBy } from 'lodash';
import { useParams } from "react-router-dom";

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import {
  withStyles,
} from "@mui/styles";
import { getReportData } from "../../services/Api";

highcharts3d(Highcharts);
sankey(Highcharts);
organization(Highcharts);
HighchartsHeatmap(Highcharts);
HighchartsTreeChart(Highcharts);

const CssTextField = withStyles({
  root: {
    "& label.Mui-focused": {
      color: "#25b3c2",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#25b3c2",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "black",
      },
      "&:hover fieldset": {
        borderColor: "#25b3c2",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#25b3c2",
      },
    },
  },
})(TextField);

const BlueSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#24b3c3',
    '&:hover': {
      backgroundColor: alpha('#24b3c3', theme.palette.action.hoverOpacity),
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#24b3c3',
  },
}));

const ExpandableTableRow = ({ children, expandData, expandCollapse, cellTHColor, ...otherProps }) => {
  const [isExpanded, setIsExpanded] = React.useState(expandCollapse);
  return (
    <>
      <TableRow {...otherProps} sx={{ fontSize: 14, fontFamily: '"Montserrat", sans-serif !important' }}>
        {children}
        <TableCell padding="checkbox">
          {expandData.DropdownHeader.length ? (
            <IconButton onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          ): null}
        </TableCell>
      </TableRow>
      {(expandData.DropdownHeader.length && (isExpanded || expandCollapse)) ? (
        <>
          <TableRow sx={{ background: '#dee3e3'}}>
            <TableCell colSpan="7" sx={{ p: 2, pb: 1, borderBottom: 'none' }}>
              <Typography fontWeight={500} color="#333333">Data Points</Typography>
            </TableCell>
          </TableRow>
          <TableRow sx={{ background: '#dee3e3'}}>
            <TableCell colSpan="7" sx={{ p: 2, pt: 0 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    {expandData.DropdownHeader.map(th => 
                      <TableCell
                        component={'th'} 
                        style={{
                          fontSize: 16, 
                          fontWeight: 400, 
                          p: 1, 
                          background: cellTHColor, 
                          maxWidth: 200,
                        }}>{th}</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chunk(expandData.DropdownData, expandData.DropdownHeader.length).map(row =>
                    <TableRow sx={{background: '#fff'}}>  
                      {row.map(td => 
                        <TableCell 
                          style={{
                            maxWidth: 220,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            wordBreak: 'break-all'
                          }} 
                          component={'td'}>{td.split()}</TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableCell>
          </TableRow>
        </>
      ): null}
    </>
  );
};

const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = React.useState(config);
  const sortedItems = React.useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};

const downloadReport = () => {
  const data = {}
  axios.post("download", data).then((res) => {
    console.log("download");
  });
};

const Report = (props) => {
  const { reportId } = useParams();
  const [reportResData, setReportResData] = useState([]);
  const [severityData, setSeverityData] = useState([]);
  const [scoreData, setScoreData] = useState([]);

  const [interactionFlow, setInteractionFlow] = useState({});
  const [fileInteractionData, setFileInteractionData] = useState([]);

  const [summaryTableData, setSummaryTableData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [tableDataSeverity, setTableDataSeverity] = useState([]);

  const [name, setName] = useState("");
  const [overAllScore, setOverAllScore] = useState(0);
  const [tool, setTool] = useState("");
  const [Pname, setPname] = useState("");

  const [treeMapDataForSummary, setTreeMapDataForSummary] = useState();

  const [licenseExpiry, setLicenseExpiry] = useState();
  const [workFlowAppDataFormain, setWorkFlowAppDataFormain] = useState();

  // severity Array
  const [highArr, setHighArr] = useState([]);
  const [mediumArr, setMediumArr] = useState([]);
  const [lowArr, setLowArr] = useState([]);
  const [compliantArr, setCompliantArr] = useState([]);
  const [naArr, setNaArr] = useState([]);

  const [workflowDropdownData, setWorkflowDropdownData] = useState([]);
  const [workflowDropdownValue, setWorkflowDropdownValue] = useState("Summary");

  const [includeNA, setIncludeNA] = useState(false);
  // const [excludeNA, setExludeNA] = useState(false);
  const [expandCollapse, setExpandCollapse] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [severityCat, setSeverityCat] = useState( ["High", "Medium", "Low", "Compliant"]);
  const [colorPallete, setColorPallete] = useState( ["#e45d5d", "#f7a35c", "rgb(144, 237, 125)", "#249200"]);
  
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('Severity');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [chartGridWidth, setChartGridWidth] = React.useState(4);

  const severityChart = React.createRef();
  const categoryChart = React.createRef();

  const [tabValue, setTabValue] = React.useState(0);

  const summaryCardItems = [
    { label: "Overall", color: '#047d91'},
    { label: "Configurability", color: '#4BBE9A'},
    { label: "Performance", color: '#B24C63'},
    { label: "Readability", color: '#A77E58'},
    { label: "Reliability", color: '#001D4A'},
    { label: "Security", color: '#CA3C25'},
  ];
  
  const { data: reportDatas, isSuccess } = useQuery(['report', reportId], () => getReportData(reportId));

  // summary table
  const summaryTable = [];
  if (workflowDropdownData.length > 1) {
    workflowDropdownData.map((workflow, index) => {
      if (workflow !== "Summary") {
        summaryTable.push({
          workFlowName: workflow,
          overAllScores: summaryTableData[index - 1],
        });
      }
    });
  }

  // workflow table----
  const observation = [];
  tableData.map((msg, index) => {
    observation.push({
      message: msg,
      severity: tableDataSeverity[index],
    });
  });

  // graph for pie-chart
  let optionssec = {
    chart: {
      type: "pie",
      height: 320,
      options3d: {
        enabled: true,
        alpha: 25,
        beta: 15,
      },
    },
    credits: {
      enabled: false,
    },
    legend: {
      layout: "horizontal",
      y: 10,
      padding: -10,
      itemMarginTop: 5,
      itemMarginBottom: 5,
      itemMarginRight: 5,
      itemStyle: {
        lineHeight: "10px",
      },
      verticalAlign: "bottom",
      align: "center",
      floating: true,
    },
    title: {
      text: "",
    },
    xAxis: {
      categories: [
        "Configurability",
        "Performance",
        "Readability",
        "Reliability",
        "Security",
      ],
      labels: {
        skew3d: true,
        style: {
          fontSize: "14px",
        },
      },
    },
    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },
    tooltip: {
      // pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>:<b>{this.point.config[2]}</b>'

      formatter: function () {
        return (
          " " +
          // this.point.name +":"+ parseFloat(this.point.y).toFixed(2) +" %" + '<br />' +
          this.point.name +
          " : " +
          parseFloat(this.point.y).toFixed(2) +
          " %" +
          "<br />"
        );
        // 'Potential: ' + this.point.potential;
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        depth: 20,
        innerSize: 50,
        dataLabels: {
          enabled: true,
          format: "{point.name} ({point.count})",
        },
        showInLegend: false,
      },
    },
    series: [
      {
        //   type: 'pie',
        name: "Severity Bugs",
        data: severityData,
      },
    ],
  };

  // graph for group column
  const [colOptions, setColOptions] = useState({
    chart: {
      type: "column",
      height: 320,
      options3d: {
        enabled: true,
        alpha: 10,
        beta: 10,
        viewDistance: 25,
        depth: 40,
      },
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    legend: {
      layout: "horizontal",
      y: 10,
      padding: -10,
      itemMarginTop: 5,
      itemMarginBottom: 5,
      itemMarginRight: 5,
      itemStyle: {
        lineHeight: "10px",
      },
      verticalAlign: "bottom",
      align: "center",
      floating: true,
    },
    xAxis: {
      categories: [
        "Configurability",
        "Performance",
        "Readability",
        "Reliability",
        "Security",
      ],
      labels: {
        skew3d: true,
        style: {
          fontSize: "14px",
        },
      },
    },

    yAxis: {
      allowDecimals: false,
      min: 0,
      title: {
        text: "",
        skew3d: true,
      },
    },
    credits: {
      enabled: false,
    },

    tooltip: {
      headerFormat: "<b>{point.key}</b><br>",
      pointFormat:
        '<span style="color:{series.color}">\u25CF</span> {series.name}: {point.y} ',
    },

    plotOptions: {
      column: {
        /* stacking: 'normal', */
        depth: 40,
      },
    },

    series: [],
  });

  React.useEffect(() => {
    if (highArr.length || mediumArr.length || lowArr.length || compliantArr.length || naArr.length) {
      const _colOptions = {...colOptions};
      _colOptions.series = [
        {
          name: "High",
          data: highArr,
          color: "#e45d5d",
          stack: "male",
        },
        {
          name: "Medium",
          data: mediumArr,
          color: "#f7a35c",
          stack: "male",
        },
        {
          name: "Low",
          data: lowArr,
          color: "rgb(144, 237, 125)",
          stack: "female",
        },
        {
          name: "Compliant",
          data: compliantArr,
          color: "#249200",
          stack: "female",
        },
      ];
      if (includeNA) {
        _colOptions.series.push({
          name: "NA",
          data: naArr,
          color: "#6b6b6b",
          stack: "female",
        });
      }
      setColOptions(_colOptions);
    }
  }, [highArr, mediumArr, lowArr, compliantArr, naArr])

  // graph for single score
  // const scoreGraph = {
  //   chart: {
  //     type: "bar",
  //   },
  //   title: {
  //     text: "",
  //   },
  //   credits: {
  //     enabled: false,
  //   },
  //   legend: {
  //     enabled: false,
  //   },
  //   xAxis: {
  //     categories: [
  //       "Overall",
  //       "Configurability",
  //       "Performance",
  //       "Readability",
  //       "Reliability",
  //       "Security",
  //     ],
  //     min: 0,
  //     max: 5,
  //   },
  //   yAxis: {
  //     title: {
  //       text: "Score",
  //     },
  //     max: 10,
  //   },
  //   plotOptions: {
  //     bar: {
  //       dataLabels: {
  //         enabled: true,
  //       },
  //       animation: {
  //         duration: 2000,
  //       },
  //     },
  //   },
  //   series: [
  //     {
  //       name: "",
  //       data: scoreData,
  //     },
  //   ],
  // };

  // org chart for file system
  const filegraph = {
    chart: {
      height: 300,
      inverted: false,
    },

    title: {
      text: "",
      // text: 'Interaction Flow'
    },
    credits: {
      enabled: false,
    },
    plotOptions: {
      series: {
        states: {
          hover: {
            enabled: true,
          },
        },
      },
    },
    tooltip: { enabled: false }, // 2nd.requirmrnt done "31 oct"
    series: [
      {
        type: "organization",
        dataLabels: {
          style: {
            fontSize: "1em",
          },
        },
        keys: ["from", "to", "weight"],
        linkRadius: 0,
        states: {
          hover: {
            color: "#97d7e6",
            borderColor: "gray",
            linkLineWidth: 2,
            linkColor: "#138e9c",
          },
        },
        data: fileInteractionData,
        levels: [
          {
            level: 0,
            color: "silver",
            dataLabels: {
              style: {
                fontSize: "5em",
                color: "black",
              },
            },
          },
          {
            level: 1,
            color: "#138e9c",
            dataLabels: {
              style: {
                fontSize: "5em",
                // color: "white",
              },
            },
          },
          {
            level: 2,
            dataLabels: {
              style: {
                fontSize: "5em",
                color: "black",
              },
            },
          },
        ],
        // nodes: fileNodes,
        colorByPoint: false,
        color: "#007ad0",
        borderColor: "white",
        nodeWidth: "150",
      },
    ],
  };

  // tree map for summary
  const treeMapSummary = {
    chart: {
      height: 330,
    },
    colorAxis: {
      minColor: "#FFFFFF",
      maxColor: "#138c9c",
    },
    plotOptions: {
      series: {
        dataLabels: {
          useHTML: true,
          inside: true,
          enabled: true,
          format:
            '{point.name}<br/><div style="font-size:14px;text-align:center;font-weight:300;">TP: {point.value}</div>',
          style: {
            fontSize: '11px',
          },
        },
      },
    },
    series: [{
      type: "treemap",
      layoutAlgorithm: "squarified",
      data: treeMapDataForSummary,
      minWidth: 150,
    }],
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
  };

  useEffect(() => {
    // workflow dropdown value
    if (isSuccess) {
      setReportResData(reportDatas);
      const dropdownData = [];
      const summaryTableOverallScore = [];
      reportDatas.map((v, i) => {
        dropdownData.push(v.DisplayName);
        if (v.DisplayName !== "Summary") {
          summaryTableOverallScore.push(v.OverallScores[0]);
        }
      });
      setWorkflowDropdownData(dropdownData);
      setSummaryTableData(summaryTableOverallScore);
      const _summary = reportDatas[0].ApplicationList.Summary;
      const arrs = lodashOrderBy(_summary, ['value'], ['desc']);
      setTreeMapDataForSummary(arrs.map((v, i) => { 
        v.colorValue = i + 1;
        return v;
      }));
      setLicenseExpiry(reportDatas[0].LicenseExpiry);

      setFileInteractionData(reportDatas[0].fileInteractionDataSummary);

      let reportData = reportDatas[0];
      //report data for report dashboard
      let sumTotal = reportData.OverallSeverity.reduce((aa, tot) => aa + tot);
      let overAllCount = reportData.OverallSeverity.reduce((total, amount) => {
        total.push((amount / sumTotal) * 100);
        return total;
      }, []);

      optionssec.series.data = [];
      let data = [];
      for (let index = 0; index < severityCat.length; index++) {
        data.push({
          name: severityCat[index],
          y: overAllCount[index],
          count: parseInt(reportData.OverallSeverity[index]),
          color: colorPallete[index],
        });
      }
      setSeverityData(data);
      let arrList = [
        "ConfigurabilitySeverity",
        "PerformanceSeverity",
        "ReadabilitySeverity",
        "ReliabilitySeverity",
        "SecuritySeverity",
      ];
      let setArrList = [
        setHighArr,
        setMediumArr,
        setLowArr,
        setCompliantArr,
        setNaArr,
      ];
      for (let index = 0; index < 5; index++) {
        let data = arrList.map((lst) => {
          return parseInt(reportData[lst][index]);
        });
        setArrList[index](data);
      }

      setInteractionFlow(reportData.InteractionFlow);
      const scores = summaryCardItems.map((item, ind) => ({ ...item, value: reportData.OverallScores[ind] }));
      setScoreData(scores);
      setTableData(reportData.ObservationMessages);
      setTableDataSeverity(reportData.ObservationSeverity);
      setName(reportData.DevName);
      setOverAllScore(reportData.OverallScores[0]);
      setPname(reportData.ProjectName);
      setTool(reportData.Tool);
    }
  }, [reportDatas, isSuccess, severityCat, colorPallete]);

  useEffect(() => {
    severityChart?.current?.chart?.reflow();
    categoryChart?.current?.chart?.reflow();
  }, [chartGridWidth]);
  // -------------------------pdf format report download handler---------------------------
  const savePdfReport = () => {
    console.log("function called!!");
    let fd = new FormData();
    fd.append("Pname", Pname.trim());
    fd.append("Tool", tool.trim());
    Promise.all([
      htmlToImage.toPng(document.getElementById("cst-card-st1"), {
        quality: 1,
      }),
      htmlToImage.toPng(document.getElementById("cst-card-st2"), {
        quality: 1,
      }),
      htmlToImage.toPng(document.getElementById("cst-card-st3"), {
        quality: 1,
      }),
      htmlToImage.toPng(document.getElementById("cst-card-st4"), {
        quality: 1,
      }),
      htmlToImage.toPng(document.getElementById("cst-card-st5"), {
        quality: 1,
      }),
      htmlToImage.toPng(document.getElementById("overall-summary"), {
        quality: 1,
        pixelRatio: 1,
        width: 1300,
        height: 40,
      }),
    ])
      .then(function (dataUrl) {
        let dataFile = [
          "SeverityCount",
          "SeverityCategory",
          "OverallScores",
          "CompFlow",
          "ObsTable",
          "Summary",
        ];
        // console.log("dataUrl", dataUrl)
        Promise.all([
          fetch(dataUrl[0]),
          fetch(dataUrl[1]),
          fetch(dataUrl[2]),
          fetch(dataUrl[3]),
          fetch(dataUrl[4]),
          fetch(dataUrl[5]),
        ]).then(async (res) => {
          let blob = null;
          for (let index = 0; index < 6; index++) {
            blob = await res[index].blob();

            fd.append(dataFile[index], blob, `${dataFile[index]}.PNG`);
          }

          //   dispatch(generateReport("", fd));
        });
      })
      .catch((err) => {
        console.log("Error constructing image", err);
      });
  };

  const { items, requestSort, sortConfig } = useSortableData(observation);

  const handleSubmit = () => {
    console.log(["workflow selected!"]);
  };

  // ---------------------------workflow dropdown handler--------------------------------
  const workflowDropdownSelectHandler = (event) => {
    setTabValue(0);
    let promise = new Promise((resolve, reject) => {
      let value = event.target.value;
      setWorkflowDropdownValue(value);
      const gridSize =  value === "Summary"? 4: 6;
      setChartGridWidth(gridSize);
      let reportData = reportResData.filter((currentValue, index) => {
        return currentValue.DisplayName === value;
      });
      reportData.push(value);
      resolve(reportData);
    });
    promise.then((reportData) => {
      console.log(reportData[1]);
      const _summary = reportResData[0].ApplicationList.Summary;
      const arrs = lodashOrderBy(_summary, ['value'], ['desc']);
      setTreeMapDataForSummary(arrs.map((v, i) => { 
        v.colorValue = i + 1;
        return v;
      }));
      setWorkFlowAppDataFormain(reportData[0].WorkflowAppData);
      //report data
      //report data for report dashboard
      let sumTotal = reportData[0].OverallSeverity.reduce(
        (aa, tot) => aa + tot
      );
      let overAllCount = reportData[0].OverallSeverity.reduce(
        (total, amount) => {
          total.push((amount / sumTotal) * 100);
          return total;
        },
        []
      );
      optionssec.series.data = [];
      let data = [];
      for (let index = 0; index < severityCat.length; index++) {
        data.push({
          name: severityCat[index],
          y: overAllCount[index],
          count: parseInt(reportData[0].OverallSeverity[index]),
          color: colorPallete[index],
        });
      }
      setSeverityData(data);
      let arrList = [
        "ConfigurabilitySeverity",
        "PerformanceSeverity",
        "ReadabilitySeverity",
        "ReliabilitySeverity",
        "SecuritySeverity",
      ];
      let setArrList = [
        setHighArr,
        setMediumArr,
        setLowArr,
        setCompliantArr,
        setNaArr,
      ];
      for (let index = 0; index < 5; index++) {
        let data = arrList.map((lst) => {
          return parseInt(reportData[0][lst][index]);
        });
        setArrList[index](data);
      }

      const nuevo = reportData[0].OverallScores.map((i) => Number(i));
      const scores = summaryCardItems.map((item, ind) => ({ ...item, value: nuevo[ind] }));
      setScoreData(scores);

      if (reportData[1] !== "Summary") {
        const interactionFlowData = reportData[1];
        console.log("interaction flow chart data", interactionFlowData);

        let nodeData = [];
        let nodes = [];

        let parentNode = reportData[1].split(".");

        console.log("parentNode", parentNode);

        nodes.push({
          id: parentNode[0],
          title: parentNode[0],
          name: parentNode[0],
          dataLabels: {
            enabled: true,
            style: {
              fontSize: "12px",
            },
          },
        });
        let rootNode = interactionFlow[interactionFlowData];
        console.log("interactionFlow", rootNode);

        rootNode.forEach((t) => {
          let len = t.split(".");

          nodeData.push([parentNode[0], len[0]]);

          nodes.push({
            id: len[0],
            title: len[0],
            name: len[0],
            dataLabels: {
              enabled: true,
              style: {
                fontSize: "12px",
              },
            },
          });
        });

        setFileInteractionData(nodeData);
      } else {
        setFileInteractionData(reportData[0].fileInteractionDataSummary);
      }

      Promise.all([
        setTableData(reportData[0].ObservationMessages),
        setTableDataSeverity(reportData[0].ObservationSeverity),
      ]).then(() => {
        console.log("Promise resolved");
      });
    });
  };

  const handleNAInclude = (event) => {
    setIncludeNA(event.target.checked);
    const _severityCat = [...severityCat];
    const _colorPallete = [...colorPallete];
    if (event.target.checked) {
      _severityCat.push("NA");
      _colorPallete.push("#6b6b6b");
    } else {
      _severityCat.pop();
      _colorPallete.pop();
    }
    setSeverityCat(_severityCat);
    setColorPallete(_colorPallete);
  }

  const getFilteredDashboardData = () => {
    let dashboardData = [...reportResData]?.filter(f => f.DisplayName === workflowDropdownValue)[0]?.DetailedDashboard;
    if (!includeNA) {
      dashboardData = dashboardData.filter(d => d.Severity !== "NA");
    }
    if (searchText) {
      const _searchText = searchText.toLowerCase();
      dashboardData = dashboardData.filter(d => {
        return d.RuleID.toLowerCase().includes(_searchText) || d.RuleCategory.toLowerCase().includes(_searchText) 
          || d.RuleName.toLowerCase().includes(_searchText) || d.Severity.toLowerCase().includes(_searchText) 
          || d.ObservationMessages.toLowerCase().includes(_searchText) || d.Suggestion.toLowerCase().includes(_searchText);
      });
    }
    return dashboardData;
  }

  const getCellColor = (severity) => {
    let color = null;
    switch (severity) {
      case 'High':
        color = '#e45d5d';
        break;
      case 'Medium':
        color = '#f7a35c';
        break;
      case 'Low':
        color = '#563db9';
        break;
      case 'Compliant':
        color = '#0b7900';
        break;
      default:
        color = '#6b6b6b';
        break;
    }
    return color;
  }

  // const handleNAExclude = (event) => {
  //   setExludeNA(event.target.checked);
  // }

  const handleExpandCollapse = (event) => {
    setExpandCollapse( event.target.checked);
  }

  const handleSearchText = (event) => {
    setSearchText(event.target.value);
  }

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
  
  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }
  
  function mapOrder (array, order, key) {
    array.sort( function (a, b) {
      var A = a[key], B = b[key];
      if (order.indexOf(A) > order.indexOf(B)) {
        return 1;
      } else {
        return -1;
      }
    });
    return array;
  };

  // This method is created for cross-browser compatibility, if you don't
  // need to support IE11, you can use Array.prototype.sort() directly
  function stableSort(array, comparator) {
    let stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    if (orderBy === "Severity") {
      let sortOrder = ["High", "Medium", "Low", "Compliant", "NA"];
      if (order === "desc") {
        sortOrder = sortOrder.reverse();
      } 
      stabilizedThis = mapOrder(array, sortOrder, orderBy);
      return stabilizedThis;
    }
    return stabilizedThis.map((el) => el[0]);
  }

  const createSortHandler = (property) => (event) => {
    handleRequestSort(event, property);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box mt={12} mb={8}>
      {!reportResData?.length ?
        <Box position={'absolute'} top={200} left={'45%'}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography variant="h6" color={'#047d91'} mb={2}>Loading report...</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress sx={{color: '#047d91'}} />
          </Box>
        </Box>
      :
        <>
          <Box className="smry-parent" id="overall-summary">
            <Typography variant="subtitle1" component={'span'} mr={3} textAlign="center" fontWeight={'500'}>
              <Tooltip title={'User'}><PersonIcon sx={{color: "#047d91", fontSize: "28px"}} /></Tooltip> {name}
            </Typography>
            <Box component={'span'} sx={{borderRight: "1px solid #cccccc", mr: 3}} />
            <Typography variant="subtitle1" component={'span'} mr={3} textAlign="center" fontWeight={'500'}>
              <Tooltip title={'Project'}><ProjectIcon sx={{color: "#047d91", fontSize: "28px"}} /></Tooltip> {Pname}
            </Typography>
            <Box component={'span'} sx={{borderRight: "1px solid #cccccc", mr: 3}} />
            <Typography variant="subtitle1" component={'span'} mr={3} textAlign="center" fontWeight={'500'}>
              <Tooltip title={'Tool'}><ToolIcon sx={{color: "#047d91", fontSize: "28px"}} /></Tooltip> {tool}
            </Typography>
            <Box component={'span'} sx={{borderRight: "1px solid #cccccc", mr: 3}} />
            <Typography variant="subtitle1" component={'span'} mr={3} textAlign="center" fontWeight={'500'}>
              <Tooltip title={'Overall Score'}><OverallScoreIcon sx={{color: "#047d91", fontSize: "28px"}} /></Tooltip> {overAllScore}
            </Typography>
            <Box component={'span'} sx={{borderRight: "1px solid #cccccc", mr: 3}} />
            <Typography variant="subtitle1" component={'span'} mr={3} textAlign="center" fontWeight={'500'}>
              <Tooltip title={'Rules Run'}><RunRulesIcon sx={{color: "#047d91", fontSize: "28px"}} /></Tooltip> {props.activeRuleForReportPage || 58} out of 58 Rules Run
            </Typography>
            {/* <Typography 
              variant="subtitle1"
              className="download-button-on-report"
              sx={{ float: "right" }}
              fontWeight={'500'}
              onClick={downloadReport}
            >
              <GetAppIcon sx={{ fontSize: "28px", color: "#047d91" }} />
              Export Reports
            </Typography> */}
            <Box display={'flex'} flexDirection="row" justifyContent={'space-between'}>
              <Box className="workflow-dropdown" minWidth={450}>
                <CssTextField
                  select
                  label="Workflow Filter"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="workflow"
                  value={workflowDropdownValue}
                  style={{ backgroundColor: "#fff" }}
                  onChange={workflowDropdownSelectHandler}
                >
                  {workflowDropdownData &&
                    workflowDropdownData.map((v, i) => {
                      return <MenuItem key={i} value={v}>{v}</MenuItem>;
                    })}
                </CssTextField>
              </Box>
              <Box mt={3}>
                <FormGroup aria-label="position" row>
                  <FormControlLabel
                    value={includeNA}
                    control={<BlueSwitch />}
                    label="Include NA"
                    labelPlacement="start"
                    onChange={handleNAInclude}
                  />
                </FormGroup>
              </Box>
            </Box>
          </Box>
          
          <Grid container spacing={3} pl={.5}>
            {scoreData.map((score, ind) =>
              <Grid key={ind} item sm={2} sx={{mt: 2}}>
                <Box display={'flex'} position="relative">
                  <Box sx={{height: 60, width: 60, borderRadius: '50%', zIndex: 100, background: score.color}}>
                    <Typography variant="body2" fontSize={17} color="#fff" textAlign="center" pt={2.2}>
                      {score.value}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{background: '#cfcfcf', position: 'absolute', pl: 4.3, pr: 1, left: 35, 
                      top: 5, height: 50, minWidth: 140, zIndex: 10, pt: 1.8, color: '#000',
                      borderRadius: '0px 30px 30px 0px'
                    }}>
                    <Typography variant="body1" fontSize={14}>
                      {score.label}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>

          <Box mt={2} mb={3}>
            <Paper sx={{ display: workflowDropdownValue !== "Summary"? 'inline-flex': 'none'}}>
              <Tabs 
                sx={{ 
                  '&.MuiTabs-root .css-1aquho2-MuiTabs-indicator': { backgroundColor: '#62cbdc' }, 
                }} 
                value={tabValue} onChange={handleTabChange} aria-label="report menu tabs">
                <Tab label="Overview" 
                  sx={{
                    '&.MuiTab-root.Mui-selected': { color: '#62cbdc', boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.1)' },
                    minWidth: '160px'
                  }} 
                />
                <Tab label="Details" 
                  sx={{
                    '&.MuiTab-root.Mui-selected': { color: '#62cbdc', boxShadow: '3px 8px 25px rgba(0, 0, 0, 0.1)' },
                    minWidth: '160px'
                  }} 
                />
              </Tabs>
            </Paper>
          </Box>

          {tabValue === 0 && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item sm={chartGridWidth} sx={{pt: 0}}>
                  <Card>
                    <Card.Header>NUMBER OF OBSERVATIONS BY SEVERITY</Card.Header>
                    <Card.Body>
                      <HighchartsReact ref={categoryChart} highcharts={Highcharts} options={optionssec} />
                    </Card.Body>
                  </Card>
                </Grid>
                <Grid item sm={chartGridWidth} sx={{pt: 0}}>
                  <Card>
                    <Card.Header>OBSERVATION SEVERITY BY CATEGORY</Card.Header>
                    <Card.Body>
                      <HighchartsReact ref={severityChart} highcharts={Highcharts} options={colOptions} />
                    </Card.Body>
                  </Card>
                </Grid>
                {workflowDropdownValue === "Summary" &&
                  <Grid item sm={4} sx={{pt: 0}}>
                    <Card>
                      <Card.Header>
                        <Tooltip title="A summary version of each workflow in the project with its Overall Score.">
                          <IconButton style={{float: "Right", padding: "0px 0px 10px 0px" }}>
                            <InfoOutlinedIcon style={{color: "#000000"}} />
                          </IconButton>
                        </Tooltip>
                        WORKFLOW INSIGHT
                      </Card.Header>
                      <Card.Body className="table-msgs" style={{ height: 340, overflowY: 'auto' }}>
                        <Table responsive="lg" style={{ width: "100%", margin: "0" }}>
                          <thead>
                            <tr>
                              <th style={{padding:"0px 0px 5px 9px"}}>Workflow Name</th>
                              <th
                                style={{ cursor: "pointer", textAlign: "center" }}
                                onClick={() => requestSort("severity")}
                              >
                                <span style={{ marginRight: "10px" }}>Overall Scores</span>{" "}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {summaryTable.map((workflow, index) => {
                              const { workFlowName, overAllScores } = workflow;
                              return (
                                <tr key={index}>
                                  <td width={800}>{workFlowName}</td>
                                  <td style={{ textAlign: "center" }}>{overAllScores} </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </Grid>
                }
              </Grid>

              {/* <Card className="sec-graph" id="cst-card-st3">
                <Card.Header>
                  <Tooltip title="The metrics below show the average scores distribution(out of 10) across the 5 major categories.">
                    <IconButton style={{float: "Right", padding: "0px 0px 10px 0px" }}>
                      <InfoOutlinedIcon style={{color: "#000000"}} />
                    </IconButton>
                  </Tooltip>
                  BOT REVIEW SCORE BY CATEGORY
                </Card.Header>
                <Card.Body>
                  <HighchartsReact highcharts={Highcharts} options={scoreGraph} />
                </Card.Body>
              </Card> */}

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item sm={6} sx={{pt: 0}}>
                  {workflowDropdownValue === "Summary" ? (
                    <Card style={{ marginBottom: "20px" }}>
                      <Card.Header>
                        <Tooltip title="The cards shows the frequency of the applications used in the entire project.">
                          <IconButton style={{float: "Right", padding: "0px 0px 10px 0px" }}>
                            <InfoOutlinedIcon style={{color: "#000000"}} />
                          </IconButton>
                        </Tooltip>
                        APPLICATION TREE
                      </Card.Header>
                      <Card.Body style={{ minHeight: 320, padding: 0, position: 'relative' }}>
                        {treeMapDataForSummary && treeMapDataForSummary.length === 0 && (
                          <h5 
                            style={{ 
                              color: "#138d9c", 
                              textAlign: "center",
                              position: 'absolute',
                              top: '45%', 
                              left: 10, 
                              right: 10, 
                            }}>
                            <strong>Note</strong>: There are no applications used in the project.
                          </h5>
                        )}
                        {treeMapDataForSummary && treeMapDataForSummary.length > 0 && (
                          <HighchartsReact
                            highcharts={Highcharts}
                            options={treeMapSummary}
                          />
                        )}
                      </Card.Body>
                    </Card>
                  ): (
                    <Card className="sec-graph" id="cst-card-st3">
                      <Card.Header>
                        <Tooltip title="The section below shows the unique applications used in this workflow.">
                          <IconButton style={{float: "Right", padding: "0px 0px 10px 0px" }}>
                            <InfoOutlinedIcon style={{color: "#000000"}} />
                          </IconButton>
                        </Tooltip>
                        APPLICATION LIST
                      </Card.Header>
                      <Card.Body style={{ minHeight: 330, position: 'relative' }}>
                        {workFlowAppDataFormain && workFlowAppDataFormain.length === 0 && (
                          <h5
                            style={{
                              color: "#138d9c",
                              textAlign: "center",
                              paddingBottom: "20px",
                              position: 'absolute',
                              top: '45%', 
                              left: 10, 
                              right: 10,
                            }}
                          >
                            <strong>Note</strong>: There are no applications used in this workflow
                          </h5>
                        )}
                        <Grid container spacing={3} sx={{p: 3}}>
                          {workFlowAppDataFormain &&
                            workFlowAppDataFormain.map((value, indx) => {
                              return (
                                <Grid key={indx} items sm={3}>
                                  <div
                                    className="workflow-App-Data-css"
                                    style={{
                                      backgroundColor: "#25b3c2",
                                      margin: "20px",
                                      textAlign: "center",
                                      padding: "10px",
                                      color: "#fff",
                                      minHeight: 70,
                                      verticalAlign: 'middle',
                                    }}
                                  >
                                    <Typography>{value}</Typography>
                                  </div>
                                </Grid>
                              );
                            })}
                        </Grid>
                      </Card.Body>
                    </Card>
                  )}
                </Grid>
                <Grid item sm={6} sx={{pt: 0}}>
                  <Card className="third-graph" id="cst-card-st4">
                    <Card.Header>
                      <Tooltip title="The tree below is a drill down that depicts a parent-child between workflows.">
                        <IconButton style={{float: "Right", padding: "0px 0px 10px 0px" }}>
                          <InfoOutlinedIcon style={{color: "#000000"}} />
                        </IconButton>
                      </Tooltip>
                      INTERACTION FLOW
                    </Card.Header>
                    <Card.Body style={{ minHeight: 330, position: 'relative' }}>
                      {fileInteractionData.length === 0 && (
                        <h5 
                          style={{ 
                            color: "#138d9c", 
                            textAlign: "center", 
                            position: 'absolute', 
                            top: '45%', 
                            left: 10, 
                            right: 10 
                          }}>
                          <strong>Note</strong>: Not enough data to generate an Interaction Flow chart.
                        </h5>
                      )}
                      {fileInteractionData.length > 0 && (
                        <HighchartsReact highcharts={Highcharts} options={filegraph} />
                      )}
                    </Card.Body>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}

          {tabValue === 1 && workflowDropdownValue !== "Summary" && (
            <Box mt={3} mb={3}>
              <Card>
                <Grid container justifyContent={'space-between'} p={2} pb={1} alignItems="center">
                  <Grid item>
                    <Typography fontWeight={500} color="#333333">DETAILED DASHBOARD</Typography>
                  </Grid>
                  <Grid item>
                    <TextField
                      label="Search here..."
                      id="outlined-size-small"
                      value={searchText}
                      size="small"
                      sx={{width: 320}}
                      onChange={handleSearchText}
                    />
                  </Grid>
                  <Grid item>
                    <Grid container>
                      <FormGroup aria-label="position" row>
                        <FormControlLabel
                          value={expandCollapse}
                          control={<BlueSwitch />}
                          label="Expand All"
                          labelPlacement="start"
                          onChange={handleExpandCollapse}
                        />
                      </FormGroup>
                    </Grid>
                  </Grid>
                </Grid>
              <TableContainer component={Paper} sx={{ mb:1 }}>
                <Table className="details-table" stickyHeader={true} sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell component="th" width={'10%'} sx={{fontSize: 16, fontWeight: 400, p: 1}}>
                        <TableSortLabel
                          active={orderBy === 'RuleID'}
                          direction={orderBy === 'RuleID' ? order : 'asc'}
                          onClick={createSortHandler('RuleID')}
                          sx={{
                            '&.MuiTableSortLabel-root': { color: '#fff' },
                            '&.MuiTableSortLabel-root:hover': { color: '#fff' },
                            '&.Mui-active': { color: '#fff' },
                            '& .MuiTableSortLabel-icon': { color: '#fff !important' },
                          }}
                        >
                          Rule ID
                          {orderBy === 'RuleID' ? (
                            <Box component="span" sx={visuallyHidden}>
                              {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                          ) : null}
                        </TableSortLabel>
                      </TableCell>
                      <TableCell component="th" width={'12%'} sx={{fontSize: 16, fontWeight: 400, p: 1}}>
                        <TableSortLabel
                          active={orderBy === 'RuleCategory'}
                          direction={orderBy === 'RuleCategory' ? order : 'asc'}
                          onClick={createSortHandler('RuleCategory')}
                          sx={{
                            '&.MuiTableSortLabel-root': { color: '#fff' },
                            '&.MuiTableSortLabel-root:hover': { color: '#fff' },
                            '&.Mui-active': { color: '#fff' },
                            '& .MuiTableSortLabel-icon': { color: '#fff !important' },
                          }}
                        >
                          Category
                          {orderBy === 'RuleCategory' ? (
                            <Box component="span" sx={visuallyHidden}>
                              {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                          ) : null}
                        </TableSortLabel>
                      </TableCell>
                      <TableCell component="th" width={'25%'} sx={{fontSize: 16, fontWeight: 400, p: 1}}>
                        <TableSortLabel
                          active={orderBy === 'RuleName'}
                          direction={orderBy === 'RuleName' ? order : 'asc'}
                          onClick={createSortHandler('RuleName')}
                          sx={{
                            '&.MuiTableSortLabel-root': { color: '#fff' },
                            '&.MuiTableSortLabel-root:hover': { color: '#fff' },
                            '&.Mui-active': { color: '#fff' },
                            '& .MuiTableSortLabel-icon': { color: '#fff !important' },
                          }}
                        >
                          Rule
                          {orderBy === 'RuleName' ? (
                            <Box component="span" sx={visuallyHidden}>
                              {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                          ) : null}
                        </TableSortLabel>
                      </TableCell>
                      <TableCell component="th" align="center" sx={{fontSize: 16, fontWeight: 400, p: 1}}>
                        <TableSortLabel
                          active={orderBy === 'Severity'}
                          direction={orderBy === 'Severity' ? order : 'asc'}
                          onClick={createSortHandler('Severity')}
                          sx={{
                            '&.MuiTableSortLabel-root': { color: '#fff' },
                            '&.MuiTableSortLabel-root:hover': { color: '#fff' },
                            '&.Mui-active': { color: '#fff' },
                            '& .MuiTableSortLabel-icon': { color: '#fff !important' },
                          }}
                        >
                          Severity
                          {orderBy === 'Severity' ? (
                            <Box component="span" sx={visuallyHidden}>
                              {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                          ) : null}
                        </TableSortLabel>
                      </TableCell>
                      <TableCell component="th" width={'25%'} sx={{fontSize: 16, fontWeight: 400, p: 1, maxWidth: 300}}>
                        <TableSortLabel
                          active={orderBy === 'ObservationMessages'}
                          direction={orderBy === 'ObservationMessages' ? order : 'asc'}
                          onClick={createSortHandler('ObservationMessages')}
                          sx={{
                            '&.MuiTableSortLabel-root': { color: '#fff' },
                            '&.MuiTableSortLabel-root:hover': { color: '#fff' },
                            '&.Mui-active': { color: '#fff' },
                            '& .MuiTableSortLabel-icon': { color: '#fff !important' },
                          }}
                        >
                          Observation Messages
                          {orderBy === 'ObservationMessages' ? (
                            <Box component="span" sx={visuallyHidden}>
                              {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                          ) : null}
                        </TableSortLabel>
                      </TableCell>
                      <TableCell component="th" width={'28%'} sx={{fontSize: 16, fontWeight: 400, p: 1, maxWidth: 300}}>
                        <TableSortLabel
                          active={orderBy === 'Suggestion'}
                          direction={orderBy === 'Suggestion' ? order : 'asc'}
                          onClick={createSortHandler('Suggestion')}
                          sx={{
                            '&.MuiTableSortLabel-root': { color: '#fff' },
                            '&.MuiTableSortLabel-root:hover': { color: '#fff' },
                            '&.Mui-active': { color: '#fff' },
                            '& .MuiTableSortLabel-icon': { color: '#fff !important' },
                          }}
                        >
                          Suggestion
                          {orderBy === 'Suggestion' ? (
                            <Box component="span" sx={visuallyHidden}>
                              {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                          ) : null}
                        </TableSortLabel>
                      </TableCell>
                      <TableCell padding="checkbox" />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stableSort(getFilteredDashboardData(), getComparator(order, orderBy))
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => (
                      <ExpandableTableRow
                        key={row.RuleName}
                        expandData={row}
                        expandCollapse={expandCollapse}
                        cellTHColor={getCellColor(row.Severity)}
                      >
                        <TableCell component="th" scope="row">{row?.RuleID}</TableCell>
                        <TableCell component="th" scope="row">{row?.RuleCategory}</TableCell>
                        <TableCell component="th" scope="row">{row?.RuleName}</TableCell>
                        <TableCell component="td" align="center">
                          <Chip label={row.Severity} sx={{ bgcolor: getCellColor(row.Severity), color: '#fff', minWidth: 110 }}></Chip>
                        </TableCell>
                        <TableCell component="td">{row.ObservationMessages}</TableCell>
                        <TableCell component="td">{row.Suggestion}</TableCell>
                      </ExpandableTableRow>
                    ))}
                    {getFilteredDashboardData().length === 0 &&
                      <TableRow>
                        <TableCell colSpan="8" align="center">No record found!</TableCell>
                      </TableRow>
                    }
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={getFilteredDashboardData().length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  '&.MuiToolbar-root': { minHeight: 50 },
                  '& .MuiTablePagination-toolbar': { minHeight: 50 },
                  '& .MuiTablePagination-displayedRows': { marginBottom: 0 },
                  '& .MuiTablePagination-selectLabel': { marginBottom: 0 },
                }}
              />
              </Card>
            </Box>
          )}
        </>
      }
    </Box>
  );
};

export default Report;
