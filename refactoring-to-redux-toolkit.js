import { createSlice } from '@reduxjs/toolkit';
import { fetchRequest, fetchSuccess } from 'actions/fetchActions';
import { actionFailure } from 'utils/notificationUtils';
import { isEqual } from 'lodash';
import userStorage from '../../utils/userStorage';
import { NO_PHOTO_URL } from '../../constants/urls';
import USER_ROLES from '../../constants/userRoles';
import { USER_DESCRIPTION, USER_TYPE } from '../../constants/userProfileConstants';
import userService from '../../services/userService';

export const initialState = {
	user: null,
};

export const user = createSlice({
	name: 'user',
	initialState,
	reducers: {
		requestUser(state) {
			return state;
		},
		requestUserSuccess(state, action) {
			return action.payload;
		},
	},
});

export default user.reducer;

export const { requestUser, requestUserSuccess } = user.actions;

export function transformUser(user) {
	const payload = {
		upsaId: user.upsaId,
		role: user.role,
		email: user.email,
		name: user.name,
		type: user.type ? user.type : USER_TYPE.default,
		description: user.description ? user.description : USER_DESCRIPTION.default,
		avatar: user.avatar ? user.avatar : NO_PHOTO_URL,
		isAdmin: user.role === USER_ROLES.admin,
		isModerator: user.role === USER_ROLES.moderator,
		office: user.office,
	};

	if (!isEqual(userStorage.data, payload)) {
		userStorage.data = payload;
	}

	return userStorage.data;
}

export function fetchUser() {
	return async dispatch => {
		dispatch(fetchRequest());
		dispatch(requestUser());
		try {
			const payload = await userService.getUser();
			dispatch(fetchSuccess());
			dispatch(requestUserSuccess(transformUser(payload)));
		} catch (error) {
			dispatch(actionFailure('User loading failed'));
		}
	};
}

export function changeUser(email) {
	return async dispatch => {
		dispatch(fetchRequest());
		dispatch(requestUser());
		try {
			await userService.changeUser(email);
			dispatch(fetchSuccess());
			dispatch(fetchUser());
		} catch (error) {
			dispatch(actionFailure('User loading failed'));
		}
	};
}