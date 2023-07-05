import React, { useEffect, useState } from "react";
import UsersList from "../components/UsersList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";

const Users = () => {
	// const USERS = [
	// 	{
	// 		id: "u1",
	// 		name: "Nikola Bogicevic",
	// 		image: "https://avatars.githubusercontent.com/u/29068353?v=4",
	// 		places: 3,
	// 	},
	// 	{
	// 		id: "u2",
	// 		name: "Lena Adalena",
	// 		image:
	// 			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D&w=1000&q=80",
	// 		places: 5,
	// 	},
	// ];

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState();
	const [loadedUsers, setLoadedUsers] = useState();

	useEffect(() => {
		const sendRequest = async () => {
			setIsLoading(true);

			try {
				const response = await fetch("http://localhost:5000/api/users");

				const responseData = await response.json();

				if (!response.ok) {
					throw new Error(responseData.message);
				}

				setLoadedUsers(responseData.users);
				setIsLoading(false);
			} catch (err) {
				setError(err.message);
			}
			setIsLoading(false);
		};
		sendRequest();
	}, []);

	const errorHandler = () => {
		setError(null);
	};

	return (
		<>
			<ErrorModal error={error} onClear={errorHandler} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
		</>
	);
};

export default Users;
