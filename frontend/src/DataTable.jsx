import { useRef, useEffect, useState } from "react";
import ReactSearchBox from "react-search-box";
import React, { Component } from "react";

const DataTable = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [searchAssignee, setSearchAssignee] = useState("");

  const [editId, setEditId] = useState(false);
  const [formData, setFormData] = useState({ title: "", assignee: "", content: "",status:"",create_at:"" });
  const [searchTitle, setSearchTitle] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const outsideClick = useRef(false);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  let filteredItems = data;
  const filteredData = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

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
      if (
        outsideClick.current &&
        !outsideClick.current.contains(event.target)
      ) {
        setEditId(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (event) => {
    setSearchTitle(event.target.value);
    search(event.target.value)
  };
  const handleAssigneeSearch = (event) => {
    setSearchAssignee(event.target.value);
    searchByAssignee(event.target.value);
  };
  function searchByAssignee(assignee) {
    const updatedList = originalData.filter((item) => item.assignee.includes(assignee));
    setData(updatedList);
  }
  function search(value){
    const updatedList = originalData.filter((item) => item.title.includes(value));
    setData(updatedList);v
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddClick =async () => {
    const now = new Date();
    const formattedDateTime = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    console.log(formattedDateTime);
    if (formData.title && formData.assignee && formData.content && formData.status) {
      const newTask = {
        title: formData.title,
        assignee:formData.assignee,
        content: formData.content,
        status: formData.status,
        create_at:formattedDateTime
      };
      
      const response = await fetch('http://127.0.0.1:3000/add-task', {
        method: 'POST',
        body: JSON.stringify(newTask),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      // console.log(result);

    
      setData([...data, newTask]);
      alert("Task added successfully !");
      setFormData({ title: "", assignee: "", content: "",status:"" });
    }
  };

  const handleEdit = (id, updatedData) => {
    if (!editId || editId !== id) {
      return;
    }

    const updatedList = data.map((item) =>{
      if(item.taskId === id ){
        console.log(item);
        fetch(`http://127.0.0.1:3000/update-task/${item.taskId}`, {
          method: "PUT",
          body: JSON.stringify({
            title:item.title,
            content:item.content,
            assignee:item.assignee,
            status:item.status
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        })
          .then(response => response.json())
          .then(() => {
            AppToaster.show({
              message: "Task updated successfully",
              intent: "success",
              timeout: 3000,
            })
          });
        return { ...item, ...updatedData }
      }
      else{
        return item;
      }
    }
    );

    // console.log(updatedList);

    setData(updatedList);
  };

  const handleDelete = (taskId, userId) => {
    if (filteredData.length === 1 && currentPage !== 1) {
      setCurrentPage((prev) => prev - 1);
    }
    const updatedList = data.filter((item) => item.taskId !== taskId);
    
    var query = `http://127.0.0.1:3000/delete?taskId=${taskId}&?userId=${userId}`;
    console.log(query);
    fetch(query, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
      alert("Task deleted successfully!");
      console.log(data);})
    .catch(error => console.error(error));

    setData(updatedList);
  };

  useEffect(() => {
    fetch('http://127.0.0.1:3000/')
       .then((res) => res.json())
       .then((data) => {
        var array=[];
          var formattedData = data.users.forEach((user)=>
          {
            var temp = user.tasks.forEach((task)=>{
              array.push({
                userId: user.userId,
                assignee: user.assignee,
                taskId: task._id,
                title: task.title,
                content: task.content,
                status: task.status,
                create_at:task.create_at
              });
            });
          }
        );
          // console.log(array);
          setData(array);
          setOriginalData(array);
       })
       .catch((err) => {
          console.log(err.message);
       });
  }, []);

  return (
    <div className="container">
      <div className="add-container">
        <div className="info-container">
          <input
            type="text"
            placeholder="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Assignee"
            name="assignee"
            value={formData.assignee}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
          />
          <select name="status" value={formData.status} onChange={handleInputChange}>
            <option value="">Status ⬇ </option>
            <option value="Todo">Todo</option>
            <option value="Inprogress">Inprogress</option>
            <option value="Done">Done</option>
          </select>
          
        </div>
        <button className="add" onClick={handleAddClick}>
          ADD
        </button>
      </div>

      <div className="search-table-container">
        <input
          className="search-input"
          type="text"
          placeholder="Search by title"
          value={searchTitle}
          onChange={handleSearch}
        />
         <input
          className="search-input"
          type="text"
          placeholder="Search by assignee"
          value={searchAssignee}
          onChange={handleAssigneeSearch}
        />

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
                  {item.assignee}
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
                {/* <td
                  id={item.taskId}
                  contentEditable={editId === item.taskId}
                  onBlur={(e) =>
                    handleEdit(item.taskId, { status: e.target.innerText})
                  }
                >
                  {item.status}
                </td> */}
                  <td id={item.taskId}
                  contentEditable={editId === item.taskId}   > 
                  <select
                    name="status"
                    value={item.status}
                    onChange={(e) => handleEdit(item.taskId, { status: e.target.value })}
                  >
                    <option value="Todo" selected={item.status === "Todo"}>Todo</option>
                    <option value="Inprogress" selected={item.status === "Inprogress"}>Inprogress</option>
                    <option value="Done" selected={item.status === "Done"}>Done</option>
                  </select>
                  </td>
                <td>
                  {/* {item.create_at = new Date(item.create_at).toLocaleDateString()} */}
                  {item.create_at}
                </td>
                <td className="taskId" hidden>
                  {item.taskId}
                </td>
                <td className="userId" hidden>
                  {item.userId}
                </td>
                
                
                <td className="actions">
                  <button
                    className="edit"
                    onClick={() => {
                      setEditId(item.taskId);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="delete"
                    onClick={() => handleDelete(item.taskId,item.userId)}
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
            { length: Math.ceil(filteredItems.length / itemsPerPage) },
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
