import React, { useEffect, useState } from "react";
import { getUsersList, getUser, updateUserDetails, getProjectsList, postUsersList } from "../utils/api";
import { MaterialReactTable } from 'material-react-table';
import { Box, Button, TextField, Checkbox, FormControlLabel } from '@mui/material';
import UsersForm from "./UsersForm";

export default function Users() {
  const [initialLoad, setInitialLoad] = useState(true);
  const [edit, setEdit] = useState(false);
  const [users, setUsers] = useState([]);
  const [processedUsers, setProcessedUsers] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [newUser, setNewUser] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', role: '' });
  const availableRoles = ['Manager', 'Supervisor', 'Operative'];

  const handleEditUser = (mail) => {
    setEdit(mail);
  };

  // Fetch projects list
  useEffect(() => {
    const fetchProjectsList = async () => {
      const result = await getProjectsList();
      setProjectsList(result);
    };
    fetchProjectsList();
  }, []);

  // Fetch users list
  useEffect(() => {
    const fetchUsersList = async () => {
      const userList = await getUsersList();
      const usersData = await Promise.all(userList.map(user => getUser(user)));
      setUsers(usersData);
      setInitialLoad(false);
    };
    if (initialLoad) {
      fetchUsersList();
    }
  }, [initialLoad]);

  // Process users data
  useEffect(() => {
    const processed = users.map(user => ({
      email: user.key,
      name: user.props?.name,
      role: user.props?.role,
      projects: user.props?.projects?.join(', ') || 'No projects assigned'
    })).filter(user => user.name && user.role); // Ensure we only include users with defined name and role
    setProcessedUsers(processed);
  }, [users]);

  const columns = React.useMemo(
    () => [
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'role', header: 'Role' },
    // Add a new column for actions
    {
      id: 'actions', // It's a good practice to give a column an ID when it doesn't directly map to a data field
      header: 'Actions',
      Cell: ({ row }) => (
        <div>
          <Button onClick={() => handleEditUser(row.original.email)} color="primary">
            Edit
          </Button>
        </div>
      ),
    },
    ],
    [],
  );

  const handleAddUser = async () => {
    const { email, name, role } = form;
    const update = { name, role, projects: [] };
    await updateUserDetails(email, update);
    const usersList = await getUsersList()
    
    if(!usersList.includes(email)){
      usersList.push(email);
      await postUsersList(usersList);
    }
    
    setNewUser(false); // Close the add user form
    setForm({ email: '', name: '', role: '' }); // Reset form
    setInitialLoad(true); // Trigger re-fetch of users
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role) => {
    setForm(prev => ({ ...prev, role }));
  };

  return (
    <div>
    {edit ? (<UsersForm
            user={edit}
            setInitialLoad={setInitialLoad}
            setEdit={setEdit}
            projectsList={projectsList}/>) : null}

    {!edit ? (
    <Box sx={{ m: 2 }}>
      <h1>Users</h1>
      <MaterialReactTable
        columns={columns}
        data={processedUsers}
        muiTableBodyRowProps={{ hover: true }}
      />
      {newUser ? (
        <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          {availableRoles.map((role, index) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.role === role}
                  onChange={() => handleRoleChange(role)}
                  name="role"
                />
              }
              label={role}
              key={index}
            />
          ))}
          <Button onClick={() => handleAddUser()} variant="contained" sx={{ mt: 2 }}>
            Submit
          </Button>
        </Box>
      ) : (
        <Button onClick={() => setNewUser(true)} variant="contained" sx={{ mt: 2 }}>
          Create New User
        </Button>
      )}
    </Box>) : null}
    
    </div>
  );
}
