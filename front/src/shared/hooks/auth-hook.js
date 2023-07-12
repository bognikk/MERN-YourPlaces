import { useCallback, useState, useEffect } from "react";

let logoutTimer;

export const useAuth = () => {
	const [token, setToken] = useState(false);
	const [userId, setUserId] = useState(false);
	const [expirationDateToken, setExpirationDateToken] = useState(); // bacause of the scoping, names do not clash

	const login = useCallback((uid, token, expirationDate) => {
		setToken(token);
		setUserId(uid);
		const tokenExpirationDate =
			expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
		setExpirationDateToken(tokenExpirationDate);
		localStorage.setItem(
			"userData",
			JSON.stringify({
				userId: uid,
				token: token,
				expiration: tokenExpirationDate.toISOString(),
			})
		);
	}, []);

	const logout = useCallback(() => {
		setToken(null);
		setUserId(null);
		setExpirationDateToken(null);
		localStorage.removeItem("userData");
	}, []);

	useEffect(() => {
		if (token && expirationDateToken) {
			const remainingTime =
				expirationDateToken.getTime() - new Date().getTime();
			logoutTimer = setTimeout(logout, remainingTime);
		} else {
			clearTimeout(logoutTimer);
		}
	}, [token, logout, expirationDateToken]);

	useEffect(() => {
		const storedData = JSON.parse(localStorage.getItem("userData"));
		if (
			storedData &&
			storedData.token &&
			new Date(storedData.expiration) > new Date()
		) {
			login(storedData.userId, storedData.token);
		}
	}, [login]);

	return { token, login, logout, userId };
};
