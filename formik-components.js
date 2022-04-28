/*
 * Copyright © 2021 EPAM Systems, Inc. All Rights Reserved. All information contained herein is, and remains the
 * property of EPAM Systems, Inc. and/or its suppliers and is protected by international intellectual
 * property law. Dissemination of this information or reproduction of this material is strictly forbidden,
 * unless prior written permission is obtained from EPAM Systems, Inc
 */
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { isNull } from 'lodash';
import moment from 'moment';
import { EVENT_STATUSES, EVENT_LABELS, STATUS_COLORS } from 'constants/eventConstants';
import { SIDEBAR_TYPES } from 'constants/sidebarConstants';
import { openSidebar } from 'reducers/sidebar';

import { Spinner } from 'components';
import PropTypes from 'prop-types';
import { useFormikContext } from 'formik';
import { Button } from 'shared';
import { AUDIENCE_TYPES, PRESENTATION_TYPES, REQUIRED_FIELDS } from 'constants/eventFormConstants';
import {
	REQUEST_FORM_FIELDS,
	REQUEST_FORM_BUTTONS,
	RequestFormSubmitButtonText,
	AVERAGE_RATING,
	TECHNOLOGY_TYPES,
} from 'constants/requestFormConstants';
import { ATTACHMENTS_PARAMS } from 'constants/fileConstants';
import {
	AttachmentsZoneWrapper,
	DatePickerWrapper,
	DropdownWrapper,
	MultiSelectWrapper,
	RadioButtonsWrapper,
	SwitcherWrapper,
	TextareaWrapper,
	TextInputWrapper,
	DailyScheduleWrapper,
	TimePickerWrapper,
} from 'components/FormWrappers';

import { getSortOptions, getEventDate, getFormattedTimeslots } from 'utils';
import isMoreThanOneDayPicked from 'utils/isMoreThanOneDayPicked';
import { EventStatusDeclinedCanceledPopup } from 'components/EventStatusDeclinedCanceledPopup';
import { DATE_FORMATS } from 'constants/dateFormatConstants';
import { EventDraftSavedPopup } from 'components/EventDraftSavedPopup';
import { EventDeleteDraftPopUp } from 'components/EventDeleteDraftPopUp';
import { SpeakersFieldArray } from './SpeakersFielsArray';
import { CloseEventPopup } from './CloseEventPopup';
import styles from './Fields.module.scss';

const mappedStatuses = (values, name) =>
	values.map(el => {
		const value = name ? el[name] : el;
		return { value, label: EVENT_LABELS[value] };
	});

const Fields = ({
	user,
	eventTypes,
	transferTypes,
	supportTypes,
	locations,
	cities,
	startDate,
	getEventDateLimit,
	formikProps,
	isEditForm,
	isCompletedEventForm,
	combinedModeratorList,
	statuses,
	containerName,
	setIsDraftToEventRequest,
	setIsDraftForm,
	isDraftEvent,
	analyticsInfo,
}) => {
	const {
		values: {
			title,
			goal,
			eventType,
			dateFrom,
			dateTo,
			timeFrom,
			timeTo,
			dailySchedule,
			budgetAvailability,
			audienceType,
			presentationType,
			location,
			attendees,
			transfer,
			itSupport,
			generalComment,
			files,
			moderatorNotes,
			moderator,
			eventStatus,
			id,
			technology,
			link,
			numberOfRegistrations,
			numberOfAttendees,
			numberOfExtRegistrations,
			extSeniorityRate,
			uniqueContacts,
			joining,
			costs,
			costPerContact,
			costPerHire,
			averageRating,
			speakers,
			nps,
			returnVisitProbability,
		},
		initialValues,
		setFieldValue,
		setFieldTouched,
		touched,
		resetForm,
		isValid,
		dirty,
		isSubmitting,
		errors,
	} = formikProps;

	const { isAdmin, isModerator } = user;
	const isAdminOrModerator = isAdmin || isModerator;
	const newEventSubmitButtonText = RequestFormSubmitButtonText[isAdminOrModerator ? 'CREATE_EVENT' : 'REQUEST_EVENT'];
	const budgetAvailabilityOptions = ['Yes', 'No'];

	const mappedOptions = options => options.map(value => ({ value }));
	const isDraftEditSidebar = isDraftEvent && isEditForm;

	const [isStartDateReceived, setIsStartDateReceived] = useState(false);

	const [isSaveAsDraftPopupShown, setIsSaveAsDraftPopupShown] = useState(false);
	const [isDeleteDraftPopupShown, setIsDeleteDraftPopupShown] = useState(false);
	const [selectedDateFrom, setSelectedDateFrom] = useState('');

	const [isDailySchedule, setDailySchedule] = useState(false);

	const [isCloseEventPopupShown, setIsCloseEventPopupShown] = useState(false);

	const handleEventClose = useCallback(() => {
		setIsCloseEventPopupShown(true);
	}, []);

	const isShowStatusInput = isEditForm && !isDraftEvent;

	const { values } = useFormikContext();

	const changeFromDraftToEvent = useCallback(() => {
		if (isDraftEvent) {
			setIsDraftToEventRequest(true);
			setIsDraftForm(true);
		}
	}, [isDraftEvent]);

	const dispatch = useDispatch();

	const showDraftIsSavedPopUp = useCallback(() => {
		setIsSaveAsDraftPopupShown(true);
		setIsDraftForm(true);
	}, [isSaveAsDraftPopupShown]);

	const openDeleteDraftPopUp = useCallback(() => {
		setIsDeleteDraftPopupShown(true);
	}, [isDeleteDraftPopupShown]);

	const resetFormFields = useCallback(fields => {
		fields.forEach(field => setFieldValue(field, initialValues[field]));
	}, []);

	const formattedStartDate = moment(startDate, 'YYYY-MM-DDTHH:mm:ss.SSS[Z]').format(DATE_FORMATS.DATE);

	const getSubmitButtonTitle = () => {
		if (isEditForm) {
			return RequestFormSubmitButtonText.UPDATE_EVENT;
		}
		if (isCompletedEventForm && !analyticsInfo) {
			return RequestFormSubmitButtonText.SAVE_INFO;
		}
		if (isCompletedEventForm && analyticsInfo) {
			return RequestFormSubmitButtonText.UPDATE_INFO;
		}
		return newEventSubmitButtonText;
	};

	useEffect(() => {
		const { eventType } = values;
		if (eventType && !isStartDateReceived && !isAdminOrModerator) {
			setIsStartDateReceived(true);
			getEventDateLimit(eventType);
			setSelectedDateFrom(dateFrom.value);
		}
	}, [values, isStartDateReceived, isAdminOrModerator, dateFrom]);

	useEffect(() => {
		if (
			isStartDateReceived &&
			!isAdminOrModerator &&
			moment(formattedStartDate, 'YYYY-MMMM-DD').isAfter(moment(selectedDateFrom, 'YYYY-MMMM-DD'))
		) {
			resetFormFields(['dateFrom', 'dateTo']);
		}
	}, [isStartDateReceived, isAdminOrModerator, formattedStartDate, selectedDateFrom]);

	const requiredFields = useMemo(() => {
		if (isAdminOrModerator) {
			return REQUIRED_FIELDS.moderator;
		}

		return REQUIRED_FIELDS.default;
	}, [isAdminOrModerator]);

	const renderVenue = useCallback(
		({ values: { presentationType, location, venue }, setFieldValue }) => {
			if (presentationType === 'Offline') {
				const preSelectedVenue = cities.find(({ name }) => name === location);

				if (preSelectedVenue && !venue) {
					setFieldValue('venue', preSelectedVenue.name);
				}

				return (
					<DropdownWrapper
						name={REQUEST_FORM_FIELDS.venue}
						title="Venue"
						containerName={containerName}
						options={cities.map(({ name }) => ({ value: name, label: name }))}
						selectedValue={{ value: venue, label: venue }}
						placeholder="Select venue"
						onChange={value => setFieldValue(REQUEST_FORM_FIELDS.venue, value)}
						requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.venue)}
					/>
				);
			}
			return null;
		},
		[cities],
	);

	const renderCateringComment = useCallback(({ values: { catering, cateringComment }, setFieldValue }) => {
		if (catering) {
			return (
				<TextareaWrapper
					name={REQUEST_FORM_FIELDS.cateringComment}
					containerName={containerName}
					value={cateringComment}
					placeholder="Catering comment"
					onChange={value => setFieldValue(REQUEST_FORM_FIELDS.cateringComment, value)}
				/>
			);
		}
		return null;
	}, []);

	const renderSouvenirsAndPrintedProductsComment = useCallback(
		({ values: { souvenirsAndPrintedProducts, souvenirsAndPrintedProductsComment }, setFieldValue }) => {
			if (souvenirsAndPrintedProducts) {
				return (
					<TextareaWrapper
						name={REQUEST_FORM_FIELDS.souvenirsAndPrintedProductsComment}
						containerName={containerName}
						value={souvenirsAndPrintedProductsComment}
						placeholder="Souvenirs and printed products comment"
						onChange={value => setFieldValue(REQUEST_FORM_FIELDS.souvenirsAndPrintedProductsComment, value)}
					/>
				);
			}
			return null;
		},
		[],
	);

	const renderBudget = useCallback(props => {
		const {
			values: { budgetAvailability, budget, catering, souvenirsAndPrintedProducts },
			setFieldValue,
		} = props;

		if (budgetAvailability === 'Yes') {
			return (
				<>
					<TextInputWrapper
						name={REQUEST_FORM_FIELDS.budget}
						containerName={containerName}
						title="General budget for event $"
						value={budget}
						placeholder="Enter amount"
						onChange={value => setFieldValue(REQUEST_FORM_FIELDS.budget, value)}
						requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.budget)}
					/>

					<SwitcherWrapper
						name={REQUEST_FORM_FIELDS.catering}
						containerName={containerName}
						title="Catering"
						defaultValue={catering}
						onChange={value => {
							setFieldValue(REQUEST_FORM_FIELDS.catering, value);

							if (!value) {
								resetFormFields(['cateringComment']);
							}
						}}
					/>

					{renderCateringComment(props)}

					<SwitcherWrapper
						name={REQUEST_FORM_FIELDS.souvenirsAndPrintedProducts}
						containerName={containerName}
						title="Souvenirs and printed products"
						defaultValue={souvenirsAndPrintedProducts}
						onChange={value => {
							setFieldValue(REQUEST_FORM_FIELDS.souvenirsAndPrintedProducts, value);

							if (!value) {
								resetFormFields(['souvenirsAndPrintedProductsComment']);
							}
						}}
					/>

					{renderSouvenirsAndPrintedProductsComment(props)}
				</>
			);
		}
		return null;
	}, []);

	const renderTransfer = useCallback(
		({ values: { transfer, transferSelected }, setFieldValue }) => {
			if (transfer) {
				return (
					<MultiSelectWrapper
						name={REQUEST_FORM_FIELDS.transferSelected}
						containerName={containerName}
						placeholder="Select transfer"
						options={transferTypes.map(option => ({
							value: option.name,
							label: option.name,
							isChecked: transferSelected.includes(option.name),
						}))}
						onChange={values =>
							values === null
								? setFieldValue(REQUEST_FORM_FIELDS.transferSelected, [])
								: setFieldValue(
										REQUEST_FORM_FIELDS.transferSelected,
										values.map(element => element.value),
								  )
						}
						defaultValue={
							isEditForm &&
							transferTypes
								.filter(option => transferSelected.includes(option.name))
								.map(({ name }) => ({
									value: name,
									label: name,
									isChecked: true,
								}))
						}
					/>
				);
			}
			return null;
		},
		[transferTypes, isEditForm],
	);

	const renderITSupport = useCallback(
		({ values: { itSupport, itSupportSelected }, setFieldValue }) => {
			if (itSupport) {
				return (
					<MultiSelectWrapper
						name={REQUEST_FORM_FIELDS.itSupportSelected}
						containerName={containerName}
						placeholder="Select IT support"
						options={supportTypes.map(option => ({
							value: option.name,
							label: option.name,
							isChecked: itSupportSelected.includes(option.name),
						}))}
						onChange={values =>
							values === null
								? setFieldValue(REQUEST_FORM_FIELDS.itSupportSelected, [])
								: setFieldValue(
										REQUEST_FORM_FIELDS.itSupportSelected,
										values.map(element => element.value),
								  )
						}
						defaultValue={
							isEditForm &&
							supportTypes
								.filter(option => itSupportSelected.includes(option.name))
								.map(({ name }) => ({
									value: name,
									label: name,
									isChecked: true,
								}))
						}
					/>
				);
			}
			return null;
		},
		[supportTypes],
	);

	const goalControl = (
		<TextareaWrapper
			name={REQUEST_FORM_FIELDS.goal}
			containerName={containerName}
			title="Event goal"
			value={goal}
			placeholder="Please describe event purpose and business value for EPAM. For example: workshop to show our expertise to potential candidates and share experience among Epamers"
			onChange={value => setFieldValue(REQUEST_FORM_FIELDS.goal, value)}
			heightLg
			requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.goal)}
		/>
	);

	const datePicker = (
		<DatePickerWrapper
			name={REQUEST_FORM_FIELDS.date}
			containerName={containerName}
			startDateForFrom={isStartDateReceived ? startDate : ''}
			selectedValueFrom={dateFrom}
			selectedValueTo={dateTo}
			placeholderFrom="From"
			placeholderTo="To"
			onChangeFrom={value => setFieldValue('dateFrom', value)}
			onChangeTo={value => setFieldValue('dateTo', value)}
			requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.date)}
			isPrevDatesSelectable={isAdminOrModerator}
		/>
	);
	const handleCancel = useCallback(() => {
		setIsStartDateReceived(false);
		resetForm();

		if (isEditForm) {
			dispatch(openSidebar(SIDEBAR_TYPES.EventDetails));
		}
	}, [isEditForm]);

	const handleDropdownWrapperChange = useCallback(
		value => {
			setFieldValue(REQUEST_FORM_FIELDS.eventType, value);
			if (!isAdminOrModerator) {
				setIsStartDateReceived(false);
			}
		},
		[isAdminOrModerator, setFieldValue],
	);

	const [isDeclinedPopupShown, setIsDeclinedPopupShown] = useState(false);
	const status = useRef(null);

	const handleStatusChange = useCallback(
		value => {
			if (value === EVENT_STATUSES.declined) {
				setIsDeclinedPopupShown(true);
				status.current = value;
			} else {
				setFieldValue(REQUEST_FORM_FIELDS.eventStatus, value);
			}
		},
		[setFieldValue],
	);

	const isSingleDayPicked = !isMoreThanOneDayPicked(dateFrom.value, dateTo.value);

	if (!values) {
		return <Spinner />;
	}

	const daysInEvent = moment(getEventDate(dateTo.value)).diff(getEventDate(dateFrom.value), 'days') + 1;

	const dailyScheduleHandler = () => {
		setDailySchedule(prevState => !prevState);
	};

	const dailyScheduleCheckbox = (
		<div className={styles.formCheckbox}>
			<label>Daily schedule</label>
			<input
				className={styles.checkboxInput}
				type="checkbox"
				checked={isDailySchedule}
				onChange={() => dailyScheduleHandler()}
			/>
		</div>
	);

	return (
		<>
			{isShowStatusInput && (
				<DropdownWrapper
					name={REQUEST_FORM_FIELDS.eventStatus}
					containerName={containerName}
					title="Status"
					options={mappedStatuses(statuses, REQUEST_FORM_FIELDS.eventStatus)}
					selectedValue={{
						value: eventStatus,
						label: EVENT_LABELS[eventStatus],
						...STATUS_COLORS[eventStatus],
					}}
					placeholder="Select Status"
					onChange={handleStatusChange}
				/>
			)}

			{isEditForm && (
				<EventStatusDeclinedCanceledPopup
					isPopupShown={isDeclinedPopupShown}
					togglePopup={setIsDeclinedPopupShown}
					id={id}
					option={status.current}
					isEditFormEventDetail
				/>
			)}

			{!isCompletedEventForm && (
				<TextInputWrapper
					name={REQUEST_FORM_FIELDS.title}
					containerName={containerName}
					title="Event title"
					value={title}
					placeholder="Enter title of the event"
					onChange={value => setFieldValue(REQUEST_FORM_FIELDS.title, value)}
					requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.title)}
				/>
			)}

			{!isAdminOrModerator && !isCompletedEventForm ? goalControl : null}

			{!isCompletedEventForm && (
				<DropdownWrapper
					name={REQUEST_FORM_FIELDS.eventType}
					containerName={containerName}
					title="Event type"
					options={eventTypes.map(option => ({ value: option.name, label: option.name }))}
					selectedValue={{
						value: eventType,
						label: eventType,
					}}
					placeholder="Select type of the event"
					onChange={handleDropdownWrapperChange}
					sortValuesFunc={getSortOptions}
					requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.eventType)}
					infoIcon
				/>
			)}
			{!isCompletedEventForm &&
				(!isSingleDayPicked ? (
					<div className={styles.multipleDaysForm}>
						<div className={styles.datesWrapper}>{datePicker}</div>
						{dailyScheduleCheckbox}
					</div>
				) : (
					datePicker
				))}

			{!isCompletedEventForm &&
				(isDailySchedule ? (
					<DailyScheduleWrapper
						name="dailySchedule"
						timeslots={dailySchedule}
						startDate={dateFrom}
						endDate={dateTo}
						daysInEvent={daysInEvent}
						requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.timeslots)}
						onChange={value => {
							setFieldValue('timeFrom', value[0]?.startTime);
							setFieldValue('timeTo', value[value.length - 1]?.endTime);
							setFieldValue('dailySchedule', getFormattedTimeslots(value));
						}}
					/>
				) : (
					<TimePickerWrapper
						name={REQUEST_FORM_FIELDS.time}
						containerName={containerName}
						selectedValueFrom={timeFrom}
						selectedValueTo={timeTo}
						onChangeFrom={value => setFieldValue('timeFrom', value)}
						onChangeTo={value => setFieldValue('timeTo', value)}
						requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.time)}
						isSingleDayPicked={isSingleDayPicked}
					/>
				))}

			{!isCompletedEventForm && (
				<RadioButtonsWrapper
					name={REQUEST_FORM_FIELDS.audienceType}
					containerName={containerName}
					title="Audience type"
					selectedValue={audienceType}
					values={mappedOptions(AUDIENCE_TYPES)}
					onChange={value => {
						setFieldValue(REQUEST_FORM_FIELDS.audienceType, value);
					}}
					requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.audienceType)}
				/>
			)}

			{!isCompletedEventForm && (
				<RadioButtonsWrapper
					name={REQUEST_FORM_FIELDS.presentationType}
					containerName={containerName}
					title="Presentation type"
					selectedValue={presentationType}
					values={mappedOptions(PRESENTATION_TYPES)}
					onChange={value => {
						setFieldValue(REQUEST_FORM_FIELDS.presentationType, value);
						if (value === 'Online') {
							resetFormFields(['venue']);
						}
					}}
					requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.presentationType)}
				/>
			)}

			{!isCompletedEventForm && (
				<DropdownWrapper
					name={REQUEST_FORM_FIELDS.location}
					containerName={containerName}
					title="Location"
					options={locations.map(option => ({ value: option.name, label: option.name }))}
					selectedValue={{ value: location, label: location }}
					placeholder="Select location"
					onChange={value => setFieldValue(REQUEST_FORM_FIELDS.location, value)}
					requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.location)}
				/>
			)}

			{!isCompletedEventForm && renderVenue(formikProps)}

			{isAdminOrModerator && !isCompletedEventForm ? goalControl : null}

			{!isCompletedEventForm && (
				<RadioButtonsWrapper
					name={REQUEST_FORM_FIELDS.budgetAvailability}
					containerName={containerName}
					title="Do you have a budget?"
					selectedValue={budgetAvailability}
					values={mappedOptions(budgetAvailabilityOptions)}
					onChange={value => {
						setFieldValue(REQUEST_FORM_FIELDS.budgetAvailability, value);

						if (value === 'No') {
							resetFormFields([
								'budget',
								'catering',
								'cateringComment',
								'souvenirsAndPrintedProducts',
								'souvenirsAndPrintedProductsComment',
							]);
						}
					}}
					bold
				/>
			)}

			{!isCompletedEventForm && renderBudget(formikProps)}

			{!isCompletedEventForm && (
				<TextInputWrapper
					name={REQUEST_FORM_FIELDS.attendees}
					containerName={containerName}
					title="Max number of attendees"
					value={attendees}
					placeholder="Enter quantity"
					onChange={value => setFieldValue(REQUEST_FORM_FIELDS.attendees, value)}
					requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.attendees)}
					errorMessage={errors?.attendees}
				/>
			)}

			{!isCompletedEventForm && (
				<SwitcherWrapper
					name={REQUEST_FORM_FIELDS.transfer}
					containerName={containerName}
					title="Transfer"
					defaultValue={transfer}
					onChange={value => {
						setFieldValue(REQUEST_FORM_FIELDS.transfer, value);

						if (!value) {
							resetFormFields(['transferSelected']);
						}
					}}
					infoIcon
				/>
			)}

			{!isCompletedEventForm && renderTransfer(formikProps)}

			{!isCompletedEventForm && (
				<SwitcherWrapper
					name={REQUEST_FORM_FIELDS.itSupport}
					containerName={containerName}
					title="IT Support"
					defaultValue={itSupport}
					onChange={value => {
						setFieldValue(REQUEST_FORM_FIELDS.itSupport, value);

						if (!value) {
							resetFormFields(['itSupportSelected']);
						}
					}}
				/>
			)}

			{!isCompletedEventForm && renderITSupport(formikProps)}

			{!isEditForm && !isCompletedEventForm && (
				<AttachmentsZoneWrapper
					name={REQUEST_FORM_FIELDS.files}
					containerName={containerName}
					title="Attachments"
					hintText="Formats: jpg, jpeg, png, bmp, svg. Max size: 20 Mb"
					files={files}
					multiple
					maxFileSize={ATTACHMENTS_PARAMS.maxFileSize}
					minFileSize={ATTACHMENTS_PARAMS.minFileSize}
					accepts={['image/jpg', 'image/jpeg', 'image/png', 'image/bmp', 'image/svg+xml']}
					clickable
					handleFilesChange={value => {
						setFieldValue(REQUEST_FORM_FIELDS.files, value);
					}}
				/>
			)}

			{!isCompletedEventForm && (
				<TextareaWrapper
					name={REQUEST_FORM_FIELDS.generalComment}
					containerName={containerName}
					title="Сomment"
					value={generalComment}
					placeholder="General comment"
					onChange={value => setFieldValue(REQUEST_FORM_FIELDS.generalComment, value)}
				/>
			)}

			{isEditForm && isAdmin ? (
				<DropdownWrapper
					name={REQUEST_FORM_FIELDS.moderator}
					containerName={containerName}
					title="Organizer"
					options={combinedModeratorList.map(({ name }) => ({ value: name, label: name }))}
					selectedValue={{ value: moderator, label: moderator }}
					placeholder="Select Organizer"
					onChange={value => setFieldValue(REQUEST_FORM_FIELDS.moderator, value)}
					sortValuesFunc={getSortOptions}
				/>
			) : null}

			{isEditForm ? (
				<TextareaWrapper
					name={REQUEST_FORM_FIELDS.moderatorNotes}
					containerName={containerName}
					title="Organizer notes"
					value={isNull(moderatorNotes) ? '' : moderatorNotes}
					placeholder="Organizer Notes"
					onChange={value => setFieldValue(REQUEST_FORM_FIELDS.moderatorNotes, value)}
				/>
			) : null}

			{isCompletedEventForm && (
				<>
					<DropdownWrapper
						name={REQUEST_FORM_FIELDS.technology}
						containerName={containerName}
						title="Technology"
						options={TECHNOLOGY_TYPES.map(option => ({ value: option.name, label: option.label }))}
						selectedValue={{
							value: technology,
							label: technology,
						}}
						placeholder="Select technology"
						onChange={value => setFieldValue(REQUEST_FORM_FIELDS.technology, value)}
						requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.technology)}
					/>

					<TextInputWrapper
						name={REQUEST_FORM_FIELDS.link}
						containerName={containerName}
						title="Link"
						value={link}
						placeholder="https://example.com"
						touched={touched?.link}
						onChange={value => {
							setFieldValue(REQUEST_FORM_FIELDS.link, value);
							setFieldTouched(REQUEST_FORM_FIELDS.link, true);
						}}
						requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.link)}
						errorMessage={errors?.link}
					/>

					<TextInputWrapper
						name={REQUEST_FORM_FIELDS.numberOfRegistrations}
						containerName={containerName}
						title="Number of registrations"
						value={numberOfRegistrations}
						placeholder="Enter quantity"
						touched={touched?.numberOfRegistrations}
						onChange={value => {
							setFieldValue(REQUEST_FORM_FIELDS.numberOfRegistrations, value);
							setFieldTouched(REQUEST_FORM_FIELDS.numberOfRegistrations, true);
						}}
						requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.numberOfRegistrations)}
						errorMessage={errors?.numberOfRegistrations}
					/>

					<TextInputWrapper
						name={REQUEST_FORM_FIELDS.numberOfAttendees}
						containerName={containerName}
						title="Number of attendees"
						value={numberOfAttendees}
						placeholder="Enter quantity"
						touched={touched?.numberOfAttendees}
						onChange={value => {
							setFieldValue(REQUEST_FORM_FIELDS.numberOfAttendees, value);
							setFieldTouched(REQUEST_FORM_FIELDS.numberOfAttendees, true);
						}}
						requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.numberOfAttendees)}
						errorMessage={errors?.numberOfAttendees}
					/>

					<TextInputWrapper
						name={REQUEST_FORM_FIELDS.numberOfExtRegistrations}
						containerName={containerName}
						title="Number of ext.registrations"
						value={numberOfExtRegistrations}
						placeholder="Enter quantity"
						touched={touched?.numberOfExtRegistrations}
						onChange={value => {
							setFieldValue(REQUEST_FORM_FIELDS.numberOfExtRegistrations, value);
							setFieldTouched(REQUEST_FORM_FIELDS.numberOfExtRegistrations, true);
						}}
						requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.numberOfExtRegistrations)}
						errorMessage={errors?.numberOfExtRegistrations}
					/>

					<TextInputWrapper
						name={REQUEST_FORM_FIELDS.extSeniorityRate}
						containerName={containerName}
						title="Ext. seniority rate, %"
						value={extSeniorityRate}
						maxLength={3}
						placeholder="Enter % from 0 to 100"
						touched={touched?.extSeniorityRate}
						onChange={value => {
							setFieldValue(REQUEST_FORM_FIELDS.extSeniorityRate, value);
							setFieldTouched(REQUEST_FORM_FIELDS.extSeniorityRate, true);
						}}
						requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.extSeniorityRate)}
						errorMessage={errors?.extSeniorityRate}
					/>

					<TextInputWrapper
						name={REQUEST_FORM_FIELDS.uniqueContacts}
						containerName={containerName}
						title="Number of unique contacts"
						value={uniqueContacts}
						placeholder="Enter quantity"
						touched={touched?.uniqueContacts}
						onChange={value => {
							setFieldValue(REQUEST_FORM_FIELDS.uniqueContacts, value);
							setFieldTouched(REQUEST_FORM_FIELDS.extSeniorityRate, true);
						}}
						requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.uniqueContacts)}
						errorMessage={errors?.uniqueContacts}
					/>

					<TextInputWrapper
						name={REQUEST_FORM_FIELDS.joining}
						containerName={containerName}
						title="Joining"
						value={joining}
						placeholder="Enter quantity"
						touched={touched?.joining}
						onChange={value => {
							setFieldValue(REQUEST_FORM_FIELDS.joining, value);
							setFieldTouched(REQUEST_FORM_FIELDS.joining, true);
						}}
						requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.joining)}
						errorMessage={errors?.joining}
					/>

					<TextInputWrapper
						name={REQUEST_FORM_FIELDS.costs}
						containerName={containerName}
						title="Costs"
						value={costs}
						placeholder="Enter quantity"
						touched={touched?.costs}
						onChange={value => {
							setFieldValue(REQUEST_FORM_FIELDS.costs, value);
							setFieldTouched(REQUEST_FORM_FIELDS.costs, true);
						}}
						requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.costs)}
						errorMessage={errors?.costs}
					/>

					<TextInputWrapper
						name={REQUEST_FORM_FIELDS.costPerContact}
						containerName={containerName}
						title="Cost per contact"
						value={costPerContact}
						placeholder="Enter quantity"
						touched={touched?.costPerContact}
						onChange={value => {
							setFieldValue(REQUEST_FORM_FIELDS.costPerContact, value);
							setFieldTouched(REQUEST_FORM_FIELDS.costPerContact, true);
						}}
						requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.costPerContact)}
						errorMessage={errors?.costPerContact}
					/>

					<TextInputWrapper
						name={REQUEST_FORM_FIELDS.costPerHire}
						containerName={containerName}
						title="Cost per hire"
						value={costPerHire}
						placeholder="Enter quantity"
						touched={touched?.costPerHire}
						onChange={value => {
							setFieldValue(REQUEST_FORM_FIELDS.costPerHire, value);
							setFieldTouched(REQUEST_FORM_FIELDS.costPerHire, true);
						}}
						requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.costPerHire)}
						errorMessage={errors?.costPerHire}
					/>

					<DropdownWrapper
						name={REQUEST_FORM_FIELDS.averageRating}
						containerName={containerName}
						title="Average rating"
						options={AVERAGE_RATING.map(option => ({ value: option, label: option }))}
						selectedValue={{
							value: averageRating,
							label: averageRating,
						}}
						placeholder="Select rating"
						onChange={value => setFieldValue(REQUEST_FORM_FIELDS.averageRating, value)}
						requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.averageRating)}
					/>

					<SpeakersFieldArray
						speakers={speakers}
						setFieldValue={setFieldValue}
						resetFormFields={resetFormFields}
						containerName={containerName}
						requiredFields={requiredFields}
						formikProps={formikProps}
					/>

					<TextInputWrapper
						name={REQUEST_FORM_FIELDS.nps}
						containerName={containerName}
						title="NPS"
						value={nps}
						touched={touched?.nps}
						placeholder="Enter quantity"
						onChange={value => {
							setFieldValue(REQUEST_FORM_FIELDS.nps, value);
							setFieldTouched(REQUEST_FORM_FIELDS.nps, true);
						}}
						requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.nps)}
						errorMessage={errors?.nps}
					/>

					<TextInputWrapper
						name={REQUEST_FORM_FIELDS.returnVisitProbability}
						containerName={containerName}
						title="Return visit probability"
						value={returnVisitProbability}
						maxLength={4}
						touched={touched?.returnVisitProbability}
						placeholder="Enter rating from 0.00 to 5.00"
						onChange={value => {
							setFieldValue(REQUEST_FORM_FIELDS.returnVisitProbability, value);
							setFieldTouched(REQUEST_FORM_FIELDS.returnVisitProbability, true);
						}}
						requiredField={requiredFields.includes(REQUEST_FORM_FIELDS.returnVisitProbability)}
						errorMessage={errors?.returnVisitProbability}
					/>
				</>
			)}

			<div className={styles.buttons}>
				<Button
					color="secondary"
					onClick={handleCancel}
					disabled={!isEditForm && !dirty}
					name={REQUEST_FORM_BUTTONS.cancel}
					containerName={containerName}
				>
					Cancel
				</Button>
				{!isEditForm && !isCompletedEventForm && (
					<>
						<Button
							color="primary"
							type="submit"
							disabled={!(dirty && errors?.attendees === undefined)}
							name={REQUEST_FORM_BUTTONS.draft}
							onClick={showDraftIsSavedPopUp}
							containerName={containerName}
						>
							Save as draft
						</Button>
						<EventDraftSavedPopup
							isPopupShown={isSaveAsDraftPopupShown}
							togglePopup={setIsSaveAsDraftPopupShown}
							id={id}
							isCanceledStatus
						/>
					</>
				)}
				{isDraftEditSidebar && (
					<>
						<Button
							className={styles.deleteBtn}
							name={REQUEST_FORM_BUTTONS.delete}
							containerName={containerName}
							onClick={openDeleteDraftPopUp}
						>
							Delete draft
						</Button>
						<EventDeleteDraftPopUp
							className="popup"
							isPopupShown={isDeleteDraftPopupShown}
							togglePopup={setIsDeleteDraftPopupShown}
							id={id}
							isCanceledStatus
						/>

						<Button
							className={styles.updateBtn}
							type="submit"
							disabled={!dirty}
							name={REQUEST_FORM_BUTTONS.update}
							containerName={containerName}
							onClick={() => setIsDraftForm(true)}
						>
							Update
						</Button>
					</>
				)}
				{isCompletedEventForm && (
					<>
						<Button
							color="primary"
							type="button"
							disabled={!(isValid && dirty) || isSubmitting}
							name={REQUEST_FORM_BUTTONS.close}
							containerName={containerName}
							onClick={() => {
								handleEventClose();
							}}
						>
							Close Event
						</Button>
						<CloseEventPopup
							name={REQUEST_FORM_BUTTONS.submit}
							className="popup"
							isPopupShown={isCloseEventPopupShown}
							togglePopup={setIsCloseEventPopupShown}
							id={id}
							setFieldValue={setFieldValue}
						/>
					</>
				)}

				<Button
					color="accent"
					type="submit"
					disabled={!(isValid && dirty) || isSubmitting}
					name={REQUEST_FORM_BUTTONS.submit}
					containerName={containerName}
					onClick={changeFromDraftToEvent}
				>
					{getSubmitButtonTitle()}
				</Button>
			</div>
		</>
	);
};

Fields.propTypes = {
	user: PropTypes.shape({
		isAdmin: PropTypes.bool,
		isModerator: PropTypes.bool,
	}),
	eventTypes: PropTypes.arrayOf(
		PropTypes.shape({ hexColor: PropTypes.string, id: PropTypes.number, name: PropTypes.string }),
	),
	transferTypes: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, name: PropTypes.string })),
	supportTypes: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, name: PropTypes.string })),
	locations: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, name: PropTypes.string })),
	cities: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, name: PropTypes.string })),
	startDate: PropTypes.string,
	getEventDateLimit: PropTypes.func,
	formikProps: PropTypes.shape({
		values: PropTypes.shape({
			title: PropTypes.string,
			eventType: PropTypes.string,
			dateFrom: PropTypes.shape({
				value: PropTypes.string,
				label: PropTypes.string,
			}),
			dateTo: PropTypes.shape({
				value: PropTypes.string,
				label: PropTypes.string,
			}),
			timeFrom: PropTypes.shape({
				value: PropTypes.string,
				label: PropTypes.string,
			}),
			timeTo: PropTypes.shape({
				value: PropTypes.string,
				label: PropTypes.string,
			}),
			budgetAvailability: PropTypes.string,
			audienceType: PropTypes.string,
			presentationType: PropTypes.string,
			attendees: PropTypes.string,
			transfer: PropTypes.bool,
			itSupport: PropTypes.bool,
			files: PropTypes.array,
			location: PropTypes.string,
			venue: PropTypes.string,
		}),
		setFieldValue: PropTypes.func,
		isValid: PropTypes.bool,
		dirty: PropTypes.bool,
	}),
	containerName: PropTypes.string.isRequired,
};

Fields.defaultProps = {
	user: {},
	eventTypes: [],
	transferTypes: [],
	supportTypes: [],
	locations: [],
	cities: [],
	startDate: '',
	getEventDateLimit: () => '',
	formikProps: {},
};

export default Fields;
