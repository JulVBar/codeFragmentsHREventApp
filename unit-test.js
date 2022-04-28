import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { errorNotifier } from 'actions/notificationActions';
import mockAxios from 'axios';

import user, { initialState, transformUser, fetchUser } from '../user-slice';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('axios');

describe('User reducer', () => {
	const currentState = { user: 'user' };

	const mockedData = {
		link: 'link',
		name: 'name',
		description: 'description',
		type: 'type',
		avatar: 'avatar',
	};

	beforeEach(() => {
		jest.resetAllMocks();
		const now = Date.now();
		Date.now = jest.fn().mockReturnValue(now);
	});

	it('Handles fetchUser fail', async () => {
		const store = mockStore({});
		const errorData = errorNotifier('User loading failed');
		const expectedActions = [
			{ type: 'FETCH_REQUEST' },
			{ type: 'user/requestUser' },
			{ type: 'FETCH_FAILURE' },
			{ ...errorData },
		];

		await store.dispatch(fetchUser());
		expect(store.getActions()).toEqual(expectedActions);
	});

	it('Handles fetchUser success', async () => {
		const store = mockStore({});

		mockAxios.request.mockResolvedValue({ data: mockedData, headers: { 'x-total-count': 0 } });

		const expectedActions = [
			{ type: 'FETCH_REQUEST' },
			{ type: 'user/requestUser' },
			{ type: 'FETCH_SUCCESS' },
			{ type: 'user/requestUserSuccess', payload: transformUser(mockedData) },
		];

		await store.dispatch(fetchUser());
		expect(store.getActions()).toEqual(expectedActions);
	});

	it('User reducer does not return default state', () => {
		expect(user(null, {})).not.toEqual(initialState);
	});

	it('User reducer return default state', () => {
		expect(user(initialState, {})).toEqual(initialState);
	});

	it('User reducer return transmitted state', () => {
		expect(user(currentState, {})).toEqual(currentState);
	});

	it('User reducer return state, if action not valid', () => {
		expect(user(currentState, { type: 'user/fake', payload: 'object' })).toEqual(currentState);
	});

	it('User reducer return state after requesting user', () => {
		expect(user(currentState, { type: 'user/requestUser' })).toEqual(currentState);
	});

	it('User reducer return state after receiving user', () => {
		expect(user(initialState, { type: 'user/requestUserSuccess', payload: mockedData })).toEqual(mockedData);
	});

	it('user reducer dont return new state, if received user is equal to user current state', () => {
		expect(user(mockedData, { type: 'user/requestUserSuccess', payload: mockedData })).toEqual(mockedData);
	});
	it('should transform data', () => {
		const userObject = {
			name: 'name',
			description: 'description',
			type: 'type',
			avatar: 'avatar',
			isAdmin: false,
			isModerator: false,
		};

		expect(transformUser(mockedData)).toEqual(userObject);
	});
});

import {
	userSelector,
	userUpsaIdIdSelector,
	isAdminSelector,
	isModeratorSelector,
	isRegularUserSelector,
} from '../selectors';

describe('Selectors', () => {
	const state = {
		user: {
			upsaId: 'upsaId',
			isAdmin: false,
			isModerator: false,
		},
	};

	it('should return current user', () => {
		expect(userSelector(state)).toEqual(state.user);
	});

	it('should return upsaId', () => {
		expect(userUpsaIdIdSelector(state)).toEqual(state.user.upsaId);
	});

	it('should return admin status bool', () => {
		expect(isAdminSelector(state)).toEqual(false);
	});

	it('should return moderator status bool', () => {
		expect(isModeratorSelector(state)).toEqual(false);
	});

	it('should return regular user status bool', () => {
		expect(isRegularUserSelector(state)).toEqual(true);
	});
});
