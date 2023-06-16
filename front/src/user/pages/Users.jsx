import React from "react";
import UsersList from "../components/UsersList";

const Users = () => {
	const USERS = [
		{
			id: "u1",
			name: "Nikola Bogicevic",
			image: "https://avatars.githubusercontent.com/u/29068353?v=4",
			places: 3,
		},
		{
			id: "u2",
			name: "Lena Adalena",
			image:
				"https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D&w=1000&q=80",
			places: 5,
		},
	];

	return <UsersList items={USERS} />;
};

export default Users;
