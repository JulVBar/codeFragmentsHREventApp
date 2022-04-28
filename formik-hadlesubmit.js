/*
 * Copyright © 2021 EPAM Systems, Inc. All Rights Reserved. All information contained herein is, and remains the
 * property of EPAM Systems, Inc. and/or its suppliers and is protected by international intellectual
 * property law. Dissemination of this information or reproduction of this material is strictly forbidden,
 * unless prior written permission is obtained from EPAM Systems, Inc
 */
import { isEmpty } from 'lodash';
import moment from 'moment';
import { EVENT_STATUSES } from 'constants/eventConstants';
import { AUDIENCE_TYPE, PRESENTATION_TYPE, FETCH_SUCCESS_MESSAGE } from 'constants/eventFormConstants';
import { multipartFetch, updateEvent, setEventEditFormSubmitted } from 'reducers/event';
import { getFormattedTime } from 'utils/timeFormat';
import { DATE_FORMATS } from 'constants/dateFormatConstants';
import { updateDraft } from 'reducers/event/event-slice';
import { checkModeratorExistence } from '../utils/utils';
// TODO: uncomment when the updateEvent method will be able to accept formattedFiles
// import { attachmnetsToBlob } from 'utils/utils';

function getFormFetchSuccessMessage(isPropose, isUpdate, eventType) {
	if (eventType === EVENT_STATUSES.draft && !isUpdate) {
		return FETCH_SUCCESS_MESSAGE.SAVED;
	}

	if (isPropose) {
		return FETCH_SUCCESS_MESSAGE.PROPOSED;
	}

	if (isUpdate) {
		return FETCH_SUCCESS_MESSAGE.UPDATED;
	}

	return FETCH_SUCCESS_MESSAGE.CREATED;
}

export function handleEventFormSubmit(values, props, dispatch) {
	const {
		id,
		title,
		goal,
		eventStatus,
		eventType,
		dateFrom,
		dateTo,
		timeFrom,
		timeTo,
		dailySchedule,
		creationTime,
		eventSatisfaction,
		audienceType,
		presentationType,
		location,
		venue,
		budget,
		cateringComment,
		souvenirsAndPrintedProductsComment,
		attendees,
		transferSelected,
		itSupportSelected,
		// TODO: uncomment when the updateEvent method will be able to accept formattedFiles
		// files,
		// attachments,
		generalComment,
		author,
		moderator,
		moderatorNotes,
		isPrivate,
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
	} = values;

	const {
		eventTypes,
		locations,
		cities,
		transferTypes,
		supportTypes,
		combinedModeratorList,
		isDraft,
		isDraftToEventRequest,
	} = props;

	const typeOfEvent = eventTypes.find(({ name }) => name === eventType);
	const city = presentationType !== PRESENTATION_TYPE.ONLINE ? cities.find(({ name }) => name === venue) : null;
	const venueObj = city && { name: city.name, id: city.id };
	const locationObj = locations.find(({ name }) => name === location);

	const getValidStartAndEndTime = ({ dateFrom, timeFrom, dateTo, timeTo, timeFunc }) => {
		const isDatesExist = dateFrom.value && timeFrom.value && dateTo.value && timeTo.value;

		if (eventStatus === EVENT_STATUSES.onHold || !isDatesExist) {
			return [null, null];
		}

		return [timeFunc(dateFrom.value, timeFrom.value), timeFunc(dateTo.value, timeTo.value)];
	};

	const [startTime, endTime] = getValidStartAndEndTime({
		dateFrom,
		timeFrom,
		dateTo,
		timeTo,
		timeFunc: getFormattedTime,
	});

	const timeslots = eventStatus !== EVENT_STATUSES.onHold ? dailySchedule : [];
	const status = isDraft ? EVENT_STATUSES.draft : eventStatus;
	const transfer = transferSelected && transferTypes.filter(({ name }) => transferSelected.includes(name));
	const itSupport = itSupportSelected && supportTypes.filter(({ name }) => itSupportSelected.includes(name));

	const [moderatorsList, moderatorObj] = checkModeratorExistence(combinedModeratorList, moderator);
	// TODO: uncomment when the updateEvent method will be able to accept formattedFiles
	// const formattedFiles = [];
	// if (!isEmpty(files)) {
	// 	files.forEach(file => {
	// 		let formattedAttachment = file.attachment;

	// 		if (formattedAttachment) {
	// 			formattedAttachment = formattedAttachment.replace(/.*base64,/, '');
	// 		}

	// 		formattedFiles.push({
	// 			attachment: formattedAttachment,
	// 			attachmentName: file.attachmentName,
	// 			attachmentExtension: file.attachmentExtension,
	// 		});
	// 	});
	// }
	const technologyObj = { name: technology, id: technology };

	const analyticsInfoObj = {
		attendees: numberOfAttendees,
		averageRate: averageRating,
		costPerContact,
		costPerHire,
		costs,
		externalRegistrations: numberOfExtRegistrations,
		externalSeniorityRate: extSeniorityRate,
		uniqueContacts,
		joining,
		nps,
		registrations: numberOfRegistrations,
		returnVisitProbability,
		speakers,
		technology: technologyObj,
		urlLink: link,
	};

	const isEventFinished = eventStatus === EVENT_STATUSES.closed || eventStatus === EVENT_STATUSES.completed;

	const formattedEvent = {
		id,
		author,
		title,
		eventStatus: status,
		businessValue: goal,
		eventType: typeOfEvent,
		startTime,
		endTime,
		timeslots,
		creationTime,
		eventSatisfaction,
		audienceType,
		presentationType,
		location: locationObj,
		venue: venueObj,
		budget,
		catering: cateringComment,
		souvenirsAndPrintedProducts: souvenirsAndPrintedProductsComment,
		maxGuestsNumber: attendees,
		transfer,
		itSupport,
		generalComment,
		isPrivate,
		moderatorNotes,
		moderator: moderatorObj,
		moderators: moderatorsList,
		analyticsInfo: isEventFinished ? analyticsInfoObj : null,
	};
	/*
        To manage "submitting" flag,
        (to start and stop submit button animation)
        it's necessary to RETURN this construction
        (that returns a Promise).
    */

	const successAction = getFormFetchSuccessMessage(false, true, eventStatus);
	const sendEventOrDraft = () => {
		dispatch(setEventEditFormSubmitted(true));
		if (isDraft) {
			return updateDraft(formattedEvent, successAction, isDraftToEventRequest);
		}
		return updateEvent(formattedEvent, successAction);
	};

	return dispatch(sendEventOrDraft());
}

export const handleRequestFormSubmit = (values, props) => {
	const {
		title,
		goal,
		eventType,
		dateFrom,
		dateTo,
		timeFrom,
		timeTo,
		dailySchedule,
		audienceType,
		presentationType,
		location,
		venue,
		budget,
		cateringComment,
		souvenirsAndPrintedProductsComment,
		attendees,
		transferSelected,
		itSupportSelected,
		files,
		generalComment,
	} = values;

	const { eventTypes, locations, cities, transferTypes, supportTypes, user, isDraft } = props;

	const typeOfEvent = eventTypes.find(({ name }) => name === eventType);
	const city = cities.find(({ name }) => name === venue);
	const venueObj = city && { name: city.name, id: city.id };
	const locationObj = locations.find(({ name }) => name === location);

	const startTime = getFormattedTime(dateFrom.value, timeFrom.value);
	const endTime = getFormattedTime(dateTo.value, timeTo.value);

	const timeslots = dailySchedule;

	const transfer = transferTypes.filter(({ name }) => transferSelected.includes(name));
	const itSupport = supportTypes.filter(({ name }) => itSupportSelected.includes(name));

	const formattedFiles = [];
	const status = isDraft ? EVENT_STATUSES.draft : EVENT_STATUSES.pending;
	if (!isEmpty(files)) {
		files.forEach(({ attachment, attachmentName, attachmentExtension }) => {
			let formattedAttachment = attachment;

			if (formattedAttachment) {
				formattedAttachment = formattedAttachment.replace(/.*base64,/, '');
			}

			formattedFiles.push({
				attachment: formattedAttachment,
				attachmentName,
				attachmentExtension,
			});
		});
	}

	const formattedEvent = {
		author: user,
		title,
		businessValue: goal,
		eventType: typeOfEvent,
		startTime,
		endTime,
		timeslots,
		audienceType,
		presentationType,
		location: locationObj,
		venue: venueObj,
		budget,
		catering: cateringComment,
		souvenirsAndPrintedProducts: souvenirsAndPrintedProductsComment,
		maxGuestsNumber: attendees,
		transfer,
		itSupport,
		generalComment,
		eventStatus: status,
	};

	const successAction = getFormFetchSuccessMessage(true, false, status);

	return multipartFetch(formattedEvent, formattedFiles, successAction, isDraft);
};

export function setEditEventFormSidebarFields(event) {
	const {
		id,
		title,
		author,
		eventStatus,
		eventType,
		startTime,
		endTime,
		timeslots,
		creationTime,
		eventSatisfaction,
		businessValue,
		audienceType,
		presentationType,
		location,
		venue,
		budget,
		catering,
		souvenirsAndPrintedProducts,
		itSupport,
		transfer,
		// TODO: uncomment when the updateEvent method will be able to accept formattedFiles
		// attachments,
		generalComment,
		maxGuestsNumber,
		moderator,
		analyticsInfo,
	} = event;

	let addInfoFormFields = null;

	if (analyticsInfo) {
		const {
			technology,
			urlLink,
			registrations,
			returnVisitProbability,
			attendees,
			averageRate,
			costPerContact,
			costPerHire,
			nps,
			costs,
			joining,
			speakers,
			externalRegistrations,
			externalSeniorityRate,
			uniqueContacts,
		} = analyticsInfo;

		addInfoFormFields = {
			technology: technology?.name || '',
			link: urlLink || '',
			numberOfRegistrations: registrations || '',
			numberOfAttendees: attendees || '',
			numberOfExtRegistrations: externalRegistrations || '',
			extSeniorityRate: externalSeniorityRate || '',
			uniqueContacts: uniqueContacts || '',
			joining: joining || '',
			costs: costs || '',
			costPerContact: costPerContact || '',
			costPerHire: costPerHire || '',
			averageRating: averageRate || '',
			speakers,
			nps: nps || '',
			returnVisitProbability: returnVisitProbability || '',
		};
	}

	const dateFrom = {
		value: startTime ? moment(startTime).format(DATE_FORMATS.YEAR_FULLMONTH_DATE) : '',
		label: startTime ? moment(startTime).format(DATE_FORMATS.FULLMONTH_DATE) : '',
	};
	const dateTo = {
		value: endTime ? moment(endTime).format(DATE_FORMATS.YEAR_FULLMONTH_DATE) : '',
		label: startTime ? moment(endTime).format(DATE_FORMATS.FULLMONTH_DATE) : '',
	};
	const timeFrom = {
		value: startTime ? moment(startTime).format('HH:mm') : '',
		label: startTime ? moment(startTime).format('HH:mm') : '',
	};
	const timeTo = {
		value: endTime ? moment(endTime).format('HH:mm') : '',
		label: endTime ? moment(endTime).format('HH:mm') : '',
	};

	const dailySchedule = timeslots;
	// TODO: uncomment when the updateEvent method will be able to accept formattedFiles
	// let eventFiles;
	// if (!isEmpty(attachments)) {
	// 	eventFiles = attachmnetsToBlob(attachments);
	// }

	return {
		id,
		title,
		author,
		eventStatus,
		goal: businessValue || '',
		eventType: eventType?.name,
		eventSatisfaction,
		dateFrom,
		dateTo,
		timeFrom,
		timeTo,
		dailySchedule,
		creationTime,
		audienceType: AUDIENCE_TYPE[audienceType],
		presentationType: PRESENTATION_TYPE[presentationType],
		location: location?.name || '',
		venue: presentationType === 'ONLINE' ? '' : venue?.name || '',
		budgetAvailability: Number(budget) > 0 ? 'Yes' : 'No',
		budget: budget || '',
		catering: !!catering,
		cateringComment: catering || '',
		souvenirsAndPrintedProducts: !!souvenirsAndPrintedProducts,
		souvenirsAndPrintedProductsComment: souvenirsAndPrintedProducts || '',
		attendees: maxGuestsNumber ? maxGuestsNumber.toString() : '',
		transfer: !!transfer?.length,
		transferSelected: transfer?.map(element => element.name),
		itSupport: !!itSupport?.length,
		itSupportSelected: itSupport?.map(element => element.name),
		// TODO: uncomment when the updateEvent method will be able to accept formattedFiles
		// files: eventFiles || [],
		generalComment: generalComment || '',
		moderator: moderator?.name || '',
		speakers: [
			{
				name: '',
				rating: '',
				isExternal: false,
				email: '',
			},
		],
		...addInfoFormFields,
	};
}

export function setCopyEventFormSubmit(event) {
	const {
		title,
		author,
		eventType,
		businessValue,
		audienceType,
		presentationType,
		location,
		venue,
		budget,
		catering,
		souvenirsAndPrintedProducts,
		itSupport,
		transfer,

		generalComment,
		maxGuestsNumber,
	} = event;

	return {
		title: `Copy of "${title}"`,
		author,
		goal: businessValue || '',
		eventType: eventType?.name,
		dateFrom: { value: '', label: '' },
		dateTo: { value: '', label: '' },
		timeFrom: { value: '', label: '' },
		timeTo: { value: '', label: '' },
		dailySchedule: [],
		audienceType: AUDIENCE_TYPE[audienceType],
		presentationType: PRESENTATION_TYPE[presentationType],
		location: location?.name || '',
		venue: presentationType === 'ONLINE' ? '' : venue?.name || '',
		budgetAvailability: Number(budget) > 0 ? 'Yes' : 'No',
		budget: budget || '',
		catering: !!catering,
		cateringComment: catering || '',
		souvenirsAndPrintedProducts: !!souvenirsAndPrintedProducts,
		souvenirsAndPrintedProductsComment: souvenirsAndPrintedProducts || '',
		attendees: maxGuestsNumber ? maxGuestsNumber.toString() : '',
		transfer: !!transfer?.length,
		transferSelected: transfer?.map(element => element.name),
		itSupport: !!itSupport?.length,
		itSupportSelected: itSupport?.map(element => element.name),

		generalComment: generalComment || '',
	};
}
export const requestFormInitialValues = eventType => {
	return {
		title: '',
		goal: '',
		eventType: eventType || '',
		dateFrom: { value: '', label: '' },
		dateTo: { value: '', label: '' },
		timeFrom: { value: '', label: '' },
		timeTo: { value: '', label: '' },
		dailySchedule: [],
		location: '',
		venue: '',
		budgetAvailability: 'No',
		audienceType: 'Internal',
		presentationType: 'Online',
		budget: '',
		catering: true,
		cateringComment: '',
		souvenirsAndPrintedProducts: true,
		souvenirsAndPrintedProductsComment: '',
		attendees: '',
		transfer: false,
		transferSelected: [],
		itSupport: false,
		itSupportSelected: [],
		files: [],
		generalComment: '',
	};
};
