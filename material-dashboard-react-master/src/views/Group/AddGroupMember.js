import React, { useEffect } from 'react';
// import react from 'react'
// import { IsEmpty, Map } from "react-lodash"
import axios from "axios";
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
// import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
// import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';
import { red, blue } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import Switch from '@material-ui/core/Switch';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import { useHistory } from "react-router-dom";
import GroupMember from "views/Group/GroupMember.js"
import NewGroup from "views/Group/NewGroup.js"
import {DisplayPageHeader, MessageToUser} from "CustomComponents/CustomComponents.js"
import {setTab} from "CustomComponents/CricDreamTabs.js"


export default function AddGroupMember() {

  // const history = useHistory();

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

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  // { id: 'userName', numeric: false, disablePadding: true, label: 'User Name' },
  { id: 'displayName', numeric: true, disablePadding: true, label: 'Member Name' },
//   { id: 'statusCount', numeric: true, disablePadding: true, label: 'Status' },
  // { id: 'carbs', numeric: true, disablePadding: false, label: 'Carbs (g)' },
  // { id: 'protein', numeric: true, disablePadding: false, label: 'Protein (g)' },
];

function EnhancedTableHead(props) {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {/* <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </TableCell> */}
        <TableCell key="select" align="center" padding='none'> </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="center"
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: '1 1 100%',
  },
  button: {
    margin: theme.spacing(0, 1, 0),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { numSelected } = props;

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
          Nutrition
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton aria-label="filter list">
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    //minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1, 
  },
  radio: {
    color: blue[200],
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  filter: {
    marginTop: '0.1rem',
    marginBottom: '0.1rem',
    fontSize: 5,
  },
  error:  {
    // right: 0,
    fontSize: '12px',
    color: blue[700],
    // position: 'absolute',
    alignItems: 'center',
    marginTop: '0px',
},

}));


const [masterData, setmasterData] = React.useState([]);
const [originalData, setOriginalData] = React.useState([]);
// const [rows, setStationTableData] = React.useState([]);
const [rows, setUserArray] = React.useState([]);
const [filterString, setfilterString] = React.useState("");
const [page, setPage] = React.useState(0);
const [dense, setDense] = React.useState(true);
const [rowsPerPage, setRowsPerPage] = React.useState(10);
const [errorMessage, setErrorMessage ] = React.useState("");
const [backDropOpen, setBackDropOpen] = React.useState(false);
const [userMessage, setUserMessage] = React.useState("");

  useEffect(() => {       
    const fetchMember = async () => {
      try {
            var response = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/user/group/${localStorage.getItem("gdGid")}`);
            setOriginalData(response.data);
            var response1 = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/user`);
            // let tmp = response1.data.sortBy(x => x.displayName);
            let tmp = response1.data;
            tmp.sort(function(a,b){
                if (a.userName > b.userName) return 1;
                if (a.userName < b.userName) return -1
                return 0;
                });                
            tmp.forEach(uuu => {
                var findtmp = response.data.filter(x => x.uid === uuu.uid);
                uuu.isMember = (findtmp.length > 0);
            });
            // console.log(tmp);
            setUserArray(tmp);
            setmasterData(tmp);
        } catch (e) {
            console.log(e)
        }
        setfilterString("")
    }
    fetchMember();
}, []);

  const classes = useStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('StationName');
  const [selected, setSelected] = React.useState([]);


  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.SubstationName);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };


const handleClick = (event, myUid) => {
    event.preventDefault();
    // console.log(myUid);
    // cannot remove admin from the member list
    if (localStorage.getItem("uid") == myUid) return;

    // take care of non admin member to add/remove
    let tmp = [].concat(masterData);
    let i;
    for(i=0; i<tmp.length; ++i) {
        if (tmp[i].uid == myUid) {
            if (tmp[i].isMember) {
                tmp[i].isMember = false;
                // console.log("it was true")
            } else {
                tmp[i].isMember = true;
                // console.log("it was false")
            }
        }
    }
    setmasterData(tmp);
  };


  const handleChangePage = (event, newPage) => {
    event.preventDefault();
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);



  function SetFilter() { 
    const chkstr = document.getElementById("filterstring").value.toLowerCase();
    setfilterString(chkstr);
    // console.log(chkstr);
    var tmp = masterData.filter(x => x.displayName.toLowerCase().includes(chkstr));
    setUserArray(tmp);
    setPage(0);
  }

  function ShowFilters() {
    return (
      <div className={classes.filter} align="right">
        <TextField className={classes.filter} id="filterstring" margin="none" size="small" defaultValue={filterString}/>        
        <Button key="filterbtn" variant="contained" color="primary" size="small"
          className={classes.button} onClick={SetFilter}>Filter
        </Button>
      </div>
    );
  }

  async function UpdateMemberList() {
    // make list of fresh member list (select existing members as well as selected new memebrs)
    var newMebmerList = masterData.filter(x => x.isMember === true);
    // console.log(newMebmerList);
    

    let uidx = 0;
    let addMember = [];
    for(uidx=0; uidx<newMebmerList.length; ++uidx) {
      let tmp = originalData.find(x => x.uid === newMebmerList[uidx].uid)
      if (!tmp) addMember.push(newMebmerList[uidx].uid);
    }
    // console.log(addMember);
    for(uidx=0; uidx<addMember.length; ++uidx) {
      let response = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/group/add/${localStorage.getItem("gdGid")}/${localStorage.getItem("uid")}/${addMember[uidx]}`)
    }

    let delMember = [];
    for(uidx=0; uidx<originalData.length; ++uidx) {
      let tmp = newMebmerList.find(x => x.uid === originalData[uidx].uid);
      if (!tmp) delMember.push(originalData[uidx].uid);
    }
    // console.log(delMember);
    for(uidx=0; uidx<delMember.length; ++uidx) {
      let response = await axios.get(`${process.env.REACT_APP_AXIOS_BASEPATH}/group/delete/${localStorage.getItem("gdGid")}/${localStorage.getItem("uid")}/${delMember[uidx]}`)
      // console.log(response);
    }
    // setErrorMessage(`Successfully added and/or removed members of group ${localStorage.getItem("gdName")}`)
    setUserMessage(`Successfully added and/or removed members of group ${localStorage.getItem("gdName")}`);
    setBackDropOpen(true);
    setTimeout(() => setBackDropOpen(false), process.env.REACT_APP_MESSAGE_TIME);
}


function ShowGmButtons() {
    return (
    <div align="center">
        <Button variant="contained" color="primary" size="small"
            // disabled={tournamentStated || (localStorage.getItem("gdAdmin").length === 0)}
            className={classes.button} onClick={UpdateMemberList}>Update List
        </Button>
        {/* <Button variant="contained" color="primary" size="small"
            className={classes.button} onClick={() => { setTab(0) }}>Done
        </Button> */}
        {/* <Switch>
            <Route  path='/admin/groupmember' component={GroupMember} key="MemberList"/>
            <Route  path='/admin/newgroup' component={NewGroup} key="NewGroup"></Route>
        </Switch> */}
    </div>)
}


  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        {/* <EnhancedTableToolbar numSelected={selected.length} /> */}
        {/* <h3 align = "center" margin-top= "0px" margin-bottom= "0px">Edit Member List ({localStorage.getItem("gdName")})</h3> */}
        <DisplayPageHeader headerName="Edit Member List" groupName={localStorage.getItem("gdName")} tournament={localStorage.getItem("gdTournament")}/>
        <ShowFilters/>
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length} 
              order={order}
              orderBy={orderBy}
              // onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                // .filter(x => x.StationName.toLowerCase().includes('r'))
                .map((row, index) => {
                  // const isItemSelected = isSelected(row.name);
                //   const isItemSelected = (selectedStation === row.StationName);
                  // console.log(`Info on ${selectedStation} and ${row.StationName}`)
                  // console.log(row);
                  const labelId = `enhanced-table-checkbox-${index}`;
                  return (
                    <TableRow
                      // hover
                      onClick={(event) => handleClick(event, row.uid)}
                      role="checkbox"
                    //   aria-checked={(selectedStation === row.StationName)}
                      tabIndex={-1}
                      key={row.uid}
                      selected={row.isMember}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={row.isMember}
                          disabled={localStorage.getItem("uid") == row.uid}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      {/* <TableCell padding="checkbox">
                        <Radio
                          color="primary"
                          checked={(selectedStation === row.StationName)}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell> */}
                      {/* <TableCell component="th" id={labelId} scope="row" align="center" padding="none">
                        {row.userName}
                      </TableCell> */}
                      <TableCell component="th" id={labelId} scope="row" align="center" padding="none">
                        {row.displayName}
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 27 : 53) * emptyRows }}>
                  <TableCell colSpan={2} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 15, 20, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      <div>
        <Typography className={classes.error} align="left">{errorMessage}</Typography>
      </div>
      <br/>
      <ShowGmButtons/>
      <MessageToUser mtuOpen={backDropOpen} mtuClose={setBackDropOpen} mtuMessage={userMessage} />
    </div>
);
}
