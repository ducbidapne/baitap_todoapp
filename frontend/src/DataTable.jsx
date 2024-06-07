import { useRef, useEffect, useState } from "react";
import Popup from 'reactjs-popup';
import { format } from 'date-fns';
import 'reactjs-popup/dist/index.css';
import Modal from 'react-modal';
import React from 'react';

const DataTable = () => {
  const customStyles = {
    content: {
      backgroundColor: '#2f2b2b',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };
  Modal.setAppElement(document.getElementById('root'));
  let subtitle;
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [modalData, setModalData] = React.useState({});

  function openModal(item) {
    setModalData(item);
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    subtitle.style.color = '#f00';
  }

  function closeModal() {
    setIsOpen(false);
  }

  const [users, setUsers] = useState([]);
  const [data, setData] = useState([]);
  const [tempData, setTempData] = useState([]);
  const [totalPage, setTotalPage] = useState([]);
  const [searchAssignee, setSearchAssignee] = useState("");
  const [editId, setEditId] = useState(false);
  const [formData, setFormData] = useState({ title: "", assignee: "", content: "", status: "Todo", create_at: "", name: "" });
  const [searchTitle, setSearchTitle] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const outsideClick = useRef(false);
  const filteredData = data;
  const total = totalPage;
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/all-user');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.user);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (isPopupOpen) {
      fetchUsers();
    }
  }, [isPopupOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTitle, searchAssignee]);

  useEffect(() => {
    if (!editId) return;
    let selectedItem = document.querySelectorAll(`[id='${editId}']`);
    selectedItem[0].focus();
  }, [editId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (outsideClick.current && !outsideClick.current.contains(event.target)) {
        setEditId(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);

    var query = 'http://127.0.0.1:3000/task?page=' + pageNumber.toString() + "&limit=5";
    // console.log("Khi bam nut" + query);
    fetch(query)
      .then((res) => res.json())
      .then((data) => {
        setData(data.result);
        // setOriginalData(data.result);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const handleSearch = (event) => {
    setSearchTitle(event.target.value);
  };

  const handleAssigneeSearch = (event) => {
    setSearchAssignee(event.target.value);
  };

  const searchByTitle = () => {
    if (searchTitle === "") {
      var query = 'http://127.0.0.1:3000/task?page=1&?limit=5';
      fetch(query)
        .then((res) => res.json())
        .then((data) => {
          var array = [];
          for (let index = 0; index < 5; index++) {
            array.push(data.result[index]);
          }
          setData(array);
          setTotalPage(data.totalPages + 1);
        })
        .catch((err) => {
          console.log(err.message);
        });
    } else {
      var query = 'http://127.0.0.1:3000/find-task-by-title?title=' + searchTitle;
      fetch(query)
        .then((res) => res.json())
        .then((data) => {
          var array = [];
          // console.log(data);
          setData(data.result);
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  };

  const searchByAssignee = (value) => {
    var query = 'http://127.0.0.1:3000/find-task-by-assignee?assignee=' + searchAssignee;
    fetch(query)
      .then((res) => res.json())
      .then((data) => {
        var array = [];
        // console.log(data);
        setData(data.result);
        // setOriginalData(array);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddClick = async () => {
    const now = new Date();
    const formattedDateTime = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    // console.log(formData);

    if (formData.title && formData.assignee && formData.content && formData.status) {
      const newTask = {
        title: formData.title,
        assignee: formData.assignee,
        content: formData.content,
        status: formData.status,
        create_at: formattedDateTime
      };

      try {
        const response = await fetch('http://127.0.0.1:3000/add-task', {
          method: 'POST',
          body: JSON.stringify(newTask),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        console.log("API Response:", result);

        if (response.ok) {
          var query = 'http://127.0.0.1:3000/task?page=1&?limit=5';
          fetch(query)
            .then((res) => res.json())
            .then((data) => {
              var array = [];
              for (let index = 0; index < 5; index++) {
                if(data.result[index]) array.push(data.result[index]);
              }
              setData(array);
              setTotalPage(data.totalPages + 1);
            })
            .catch((err) => {
              console.log(err.message);
            });
          alert("Task added successfully!");
          setFormData({ title: "", assignee: "", content: "", status: "Todo" });
        } else {
          alert("Task addition failed!");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      alert("Please fill in all fields");
    }
  };

  const handleEdit = (id, updatedData) => {
    if (!editId || editId !== id) {
      return;
    }

    const updatedList = data.map((item) => {
      if (item.taskId === id) {
        fetch(`http://127.0.0.1:3000/update-task/${item.taskId}`, {
          method: "PUT",
          body: JSON.stringify({
            title: item.title,
            content: item.content,
            assignee: item.assignee,
            status: item.status
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        })
          .then(response => response.json())
          .then(() => {
            // Handle success notification
          });
        return { ...item, ...updatedData };
      } else {
        return item;
      }
    });

    setData(updatedList);
  };

  const handleDelete = (taskId, userId) => {
    if (filteredData.length === 1 && currentPage !== 1) {
      setCurrentPage((prev) => prev - 1);
    }
    const updatedList = data.filter((item) => item.taskId !== taskId);

    if (confirm("Are you sure to delete this task?")) {
      var query = `http://127.0.0.1:3000/delete?taskId=${taskId}&userId=${userId}`;
      fetch(query, {
        method: 'DELETE'
      })
        .then(res => res.json())
        .then(() => {
          alert("Task deleted successfully!");
        })
        .catch(error => console.error(error));

      setData(updatedList);
    }
  };

  useEffect(() => {
    var query = 'http://127.0.0.1:3000/task?page=1&?limit=5';
    fetch(query)
      .then((res) => res.json())
      .then((data) => {
        if(data.result){
          var array = [];
          for (let index = 0; index < 5; index++) {
            if(data.result[index])array.push(data.result[index]);
          }
          setData(array);
          setTotalPage(data.totalPages + 1);
        }else setData([]);
       
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

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

  const handleModalInputChange = (e) => {
    setModalData({ ...modalData, [e.target.name]: e.target.value });
    // console.log(modalData);
  };


  const handleSubmit= (event)=> {
    var temp = users.find((user)=>user.assignee=="No assignee");
    if((temp._id==modalData.userId)&&(user.status!="Todo")){
      alert("invalid");
    }else{
      const updatedList = data.map((item) => {
        if (item.taskId === modalData.taskId) {
          fetch(`http://127.0.0.1:3000/update-task/${item.taskId}`, {
            method: "PUT",
            body: JSON.stringify({
              title: modalData.title,
              content: modalData.content,
              assignee: modalData.userId,
              status: modalData.status
            }),
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
          })
            .then(response => response.json())
            .then(() => {
              setData(updatedList);
              closeModal();
              alert("Task updated successfull!");
            });
          return { ...item, ...updatedData };
        } else {
          return item;
        }
      });
    
    }
  
  }

  return (
    <div className="container">
      <div>
        <Popup
          trigger={<button onClick={() => setIsPopupOpen(true)}> Add</button>}
          position="center"
          className="popup"
          onClose={() => setIsPopupOpen(false)}
        >
          <div>
            <div className="info-container">
              <input
                type="text"
                value="ADD A NEW TASK"
                readOnly
              />
              <input
                type="text"
                placeholder="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
              <select
                name="assignee"
                value={formData.assignee}
                onChange={handleInputChange}
              >
                <option value="" disabled>Select assignee</option>
                {users.map((user) => (
                  <option value={user._id}>{user.assignee.trim() ? user.assignee : "No assignee"}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
              />
              <input
                type="text"
                placeholder="status"
                name="status"
                value={formData.status}
                readOnly
                hidden
              />
              <div>
                <button className="add" onClick={handleAddClick}>
                  ADD
                </button>
              </div>
            </div>
          </div>
        </Popup>
      </div>

      <div className="search-table-container">
        <div className="block-search">
          <input id="search-text"
            className="search-input"
            type="text"
            placeholder="Search by title"
            value={searchTitle}
            onChange={handleSearch}
          />
          <button onClick={searchByTitle}>
            Search by title
          </button>
        </div>
        <div className="block-search">
          <select id="select"
            name="assignee"
            value={formData.assignee}
            onChange={handleAssigneeSearch}
          >
            <option value="" disabled>Select assignee</option>
            {users.map((user) => (
              <option value={user._id}>{user.assignee.trim() ? user.assignee : "No assignee"}</option>
            ))}
          </select>
          <button className="search" onClick={searchByAssignee}>
            Search by assignee
          </button>
        </div>

        <table ref={outsideClick}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Assignee</th>
              <th>Content</th>
              <th>Status</th>
              <th>Create at</th>
              <th>Action</th>
              <th hidden>ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.taskId}>
                <td
                  id={item.taskId}
                  contentEditable={editId === item.taskId}
                  onBlur={(e) =>
                    handleEdit(item.taskId, { title: e.target.innerText })
                  }
                >
                  {item.title}
                </td>
                <td
                  id={item.taskId}
                  contentEditable={editId === item.taskId}
                  onBlur={(e) =>
                    handleEdit(item.taskId, { assignee: e.target.innerText })
                  }
                >
                  {item.assignee !== " " ? item.assignee : "No assignee"}
                </td>
                <td
                  id={item.taskId}
                  contentEditable={editId === item.taskId}
                  onBlur={(e) =>
                    handleEdit(item.taskId, { content: e.target.innerText })
                  }
                >
                  {item.content}
                </td>
                <td
                  id={item.taskId}
                  contentEditable={editId === item.taskId}
                  onBlur={(e) =>
                    handleEdit(item.taskId, { status: e.target.innerText })
                  }
                >
                  {item.status}
                </td>
                <td>
                  {format(new Date(item.create_at), 'MMMM do yyyy, h:mm:ss a')}
                </td>
                <td className="taskId" hidden>
                  {item.taskId}
                </td>
                <td className="userId" hidden>
                  {item.userId}
                </td>
                <td className="actions">
                  <button onClick={() => openModal(item)}>Edit</button>
                  <Modal
                    isOpen={modalIsOpen}
                    onAfterOpen={afterOpenModal}
                    onRequestClose={closeModal}
                    style={customStyles}
                  >
                    <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Update task</h2>
                    <form  onSubmit={handleSubmit}>
                    <label for="title">Title</label>
                    <br/>
                      <input
                        id='title'
                        type="text"
                        name="title"
                        value={modalData.title}
                        onChange={handleModalInputChange}
                      />
                      <br/>
                      <label for="assignee">Assignee</label>
                      <br/>
                      {/* <input
                        id="assignee"
                        type="text"
                        name="assignee"
                        value={modalData.assignee}
                        onChange={handleModalInputChange}
                      /> */}
                        <select
                          name="userId"
                         
                          onChange={handleModalInputChange}
                        >
                          <option value={modalData.assignee}>{modalData.assignee}</option>
                          {users.map((user) => (
                            <option value={user._id}>{user.assignee.trim() ? user.assignee : "No assignee"}</option>
                          ))}
                        </select>
                       <br/>
                       <label for="content">Assignee</label>
                      <br/>
                      <input
                        id="content"
                        type="text"
                        name="content"
                        value={modalData.content}
                        onChange={handleModalInputChange}
                      />
                       <br/>
                       <label for="status">Assignee</label>
                      <br/>
                      <select id="status"
                        name="status"
                        onChange={handleModalInputChange}
                      > <option value={modalData.status}>{modalData.status} </option>
                        <option value="Todo">Todo</option>
                        <option value="Inprogress">Inprogress</option>
                        <option value="Done">Done</option>
                      </select>
                   
                      <br/>
                      <button id="buttonSave" type="submit" value="Submit">Save</button>
                      <button id="buttonCancel" type="button" onClick={closeModal}>Close</button>
                    </form>
                  </Modal>
                  <button
                    className="delete"
                    onClick={() => handleDelete(item.taskId, item.userId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          {Array.from(
            { length: total },
            (_, index) => (
              <button
                key={index + 1}
                style={{
                  backgroundColor: currentPage === index + 1 && "lightgreen",
                }}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default DataTable;
