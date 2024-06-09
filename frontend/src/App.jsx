import React, { useState, useEffect } from 'react';
import './App.css';
import MUIDataTable from "mui-datatables";
import { format } from 'date-fns';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TablePagination from '@mui/material/TablePagination';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';


function App() {
  const [selectedUser, setSelectedUser] = useState('');
  const [errors, setErrors] = useState({ title: false, userId: false, content: false });
  const [currentTask, setCurrentTask] = useState(null); 
  const [isEditMode, setIsEditMode] = useState(false);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalRows, setTotalRows] = useState(0);
  const rowsPerPageOptions = [5];
  const [open, setOpen] = useState(false); 
  const [newTask, setNewTask] = useState({ title: '', content: '',status:'Todo',create_at:'',userId:'', assignee:'' }); 
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  

const columns = [
  {
    name: "taskId",
    options: {
      display: false,
    }
  },
  {
    name: "userId",
    options: {
      display: false,
    }
  },
  {
    name: "title",
  },
  {
    name: "assignee"
  },
  {
    name: "content",
  },
  {
    label: "CREATE AT",
    name: "create_at",
    options: {
      customBodyRender: (value) => (
        <span>{format(new Date(value), 'dd/MM/yyyy HH:mm')}</span>
      )
    }
  },
  {
    name: "status",
    options: {
      customBodyRender: (value) => (
        <p className={`capitalize px-3 py-1 inline-block rounded-full ${
          value === "Todo" ? "bg-pink-500" : ""
        }${
          value === "Inprogress" ? "bg-yellow-500" : ""
        }${
          value === "Done" ? "bg-green-500" : ""
        }`}>{value}</p>
      )
    }
  },
  {
    name: "edit",
    options: {
      customBodyRender: (value, tableMeta) => (
        <button className='btn-update px-3 py-1 inline-block rounded-full bg-blue-500' onClick={() => handleEdit(tableMeta.rowData)}>Edit</button>
      )
    }
  },
  {
    name: "delete",
    options: {
      customBodyRender: (value, tableMeta) => (
        <button className='btn-delete px-3 py-1 inline-block rounded-full bg-red-500' onClick={() => handleDelete(tableMeta.rowData[0],tableMeta.rowData[1])}>Delete</button>
      )
    }
  }
];

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewTask({ ...newTask, [name]: value });
  };


  const handleDelete = (taskId,userId) => {
    console.log("Delete clicked for taskId:", taskId,userId);
    var tempTaskId = taskId;
    var tempUserId = userId;
    if (confirm("Are you sure to delete this task?")) {
      var query = `http://127.0.0.1:3000/delete?taskId=${taskId}&userId=${userId}`;
      fetch(query, {
        method: 'DELETE'
      })
      .then(res => {
        if (!res.ok) {
          alert("Task not found!");
          throw new Error(`HTTP error! status: ${res.status}`);
           
        }
        return res.json();
      })
        .then(() => {
          fetchData();
          setData(prevData => prevData.filter(task => task.taskId !== tempTaskId));
          alert("Task deleted successfully!"); 
        })
        .catch(error => console.error(error));
        
       
    }
    
  };
  const handleSearch = () => {
    setSearchQuery(searchInput);
    fetchData();
  };

  const handleEdit = (rowData) => {
    setIsEditMode(true);
    setCurrentTask(rowData[0]); // Assuming the first element is taskId
    setNewTask({
      title: rowData[2],
      content: rowData[4],
      status: rowData[6],
      create_at: rowData[5],
      userId: rowData[1],
      assignee: rowData[3]
    });
    handleOpen();
  };

  const handleSaveEdit = () => {
    if (!validateFields()) {
      return;
    }
    
    var temp = newTask.userId.split(",");
    newTask.userId = temp[0];
    newTask.assignee = temp[1];
    var temp = users.find((user)=>user.assignee=="No assignee");
    if ((newTask.userId ===temp._id)&&(newTask.status!=="Todo")) {
      alert("No assignee: cannot change status.");
      return;
    }

    const query = `http://127.0.0.1:3000/update-task?taskId=${currentTask}`;
    fetch(query, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        fetchData();
        handleClose();
        alert("Task updated successfully!");
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const validateFields = () => {
    const newErrors = {
      title: !newTask.title,
      userId: !newTask.userId,
      content: !newTask.content
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleUserChange = (event) => {
    const userId = event.target.value;
    setSelectedUser(userId);
    fetchTasksByUser(userId);
  };
  const fetchTasksByUser = (userId) => {
    
    const query = `http://127.0.0.1:3000/find-task-by-assignee?userId=${userId}`;
    console.log(query);
    fetch(query)
      .then(response => response.json())
      .then(result => {
        setData(result?.result);
        setTotalRows(result?.totalPages * rowsPerPage);
      })
      .catch(error => console.error('Error fetching tasks:', error));
  };
  
  
  const handleAddTask = () => {
    if (!validateFields()) {
      return;
    }

    const now = new Date();
    const formattedDateTime = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    var temp = newTask.userId.split(",");
    newTask.userId = temp[0];
    newTask.assignee = temp[1];
    newTask.create_at = formattedDateTime;
    fetch('http://127.0.0.1:3000/add-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        // setData(prevData => [newTask, ...prevData]);
        fetchData();
        setNewTask({ title: '', assignee: '', content: '' });
        handleClose(); 
        alert("Task added successfully!");
      })
      .catch(error => {
        alert("Task not found!");
        console.error('Error:', error);
      });
  };
  
  

  const fetchData = async () => {
    try {
      const query = `http://127.0.0.1:3000/task?page=${page + 1}&limit=${rowsPerPage}&search=${searchQuery}`;
      const response = await fetch(query);
      const result = await response.json();
      setData(result?.result);
      setTotalRows(result?.totalPages * rowsPerPage);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
 useEffect(() => {


    fetchData();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 5));
    setPage(0);
  };
  useEffect(() => {
    fetch('http://localhost:3000/all-user')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.user);
        console.log(data.user);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);



  const getMuiTheme = () => createTheme({
    palette: {
      background: {
        paper: "#0f172a",
        default: "#0f172a",
      },
      text: {
        primary: "#e2e8f0",
      },
      mode: 'dark',
    },
    components: {
      MuiTableCell: {
        styleOverrides: {
          head: {
            left:"0",
            padding: "10px 4px",
            backgroundColor: "#0f172av",
            color: "#e2e8f0",
          },
          body: {
            padding: "17px 16px",
            color: "#e2e8f0",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:nth-of-type(odd)': {
              backgroundColor: "#0f172a",
            },
            '&:nth-of-type(even)': {
              backgroundColor: "#0f172a",
            },
          },
        },
      },
    },
  });

  return (
    
    <div className='bg-slate-700 py-10 min-h-screen grid place-items-center'>
      <div>
         

        <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditMode ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              required
              margin="dense"
              name="title"
              label="Title"
              type="text"
              fullWidth
              value={newTask.title}
              onChange={handleChange}
              error={errors.title}
              helperText={errors.title && "Title is required"}
            />
            <FormControl fullWidth margin="dense" error={errors.userId}>
              <InputLabel id="assignee-label">Assignee</InputLabel>
              <Select
                labelId="assignee-label"
                id="assignee"
                name="userId"
                onChange={handleChange}
                fullWidth
              >
                {users.map(user => (
                  <MenuItem key={user._id} value={`${user._id}`}>
                    {user.assignee}
                  </MenuItem>
                ))}
              </Select>
              {errors.userId && <FormHelperText>Assignee is required</FormHelperText>}
            </FormControl>
            <TextField
              required
              margin="dense"
              name="content"
              label="Content"
              type="text"
              fullWidth
              value={newTask.content}
              onChange={handleChange}
              error={errors.content}
              helperText={errors.content && "Content is required"}
            />
            <FormControl className='w-[20%] py-3' margin="dense">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                name="status"
                value={newTask.status}
                onChange={handleChange}
                
              >
                <MenuItem selected value="Todo">Todo</MenuItem>
                <MenuItem value="Inprogress">Inprogress</MenuItem>
                <MenuItem value="Done">Done</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>

          <DialogActions>
           <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={isEditMode ? handleSaveEdit : handleAddTask} color="primary">
              {isEditMode ? "Save" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>

      </div>
      <div className='w-10/12 max-w-4xl'>
      <div className="grid grid-cols-3   gap-4">
  <div className="col-span-2">
    <TextField
      label="Search"
      value={searchQuery}
      onChange={handleSearchChange}
      margin="dense"
      fullWidth
    />
  </div>
  <div className="flex items-center space-x-4">
    <Button
      className='btn-search px-3 py-1 rounded-full bg-blue-500 text-white'
      variant="contained"
      color="primary"
      onClick={handleSearch}
    >
      Search
    </Button>
    <FormControl fullWidth margin="dense">
      <InputLabel id="user-label">Select User</InputLabel>
      <Select
        labelId="user-label"
        id="user"
        name="user"
        value={selectedUser}
        onChange={handleUserChange}
        fullWidth
      >
        {users.map(user => (
          <MenuItem key={user._id} value={`${user._id}`}>
            {user.assignee}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <Button
      className='btn-add px-3 py-1 rounded-full bg-green-500 text-white'
      variant="contained"
      color="primary"
      onClick={handleOpen}
    >
      Add
    </Button>
  </div>
</div>
      <div  className="">
          <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              style={{ overflow: 'auto' }}
              title={"Tasks List"}
              data={data}
              columns={columns}
              options={{
                selectableRows: false,
                pagination: false,
                download: false,
                print: false,
                viewColumns: false,
                filter: false,
                responsive: 'standard',
                search:false,
              }}
              
            />
          
          </ThemeProvider>
        </div>
      </div>
      <TablePagination
              className="mui-table-pagination"
              component="div"
              count={totalRows}
              page={page}
              rowsPerPageOptions={rowsPerPageOptions}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              
            />

    </div>
  );
}

export default App;
