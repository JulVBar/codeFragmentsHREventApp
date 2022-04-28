export function handleEventFormSubmit(values, dispatch) {
	const {
		id,
		title,
		goal,
		eventStatus,
		creationTime,
		eventSatisfaction,
		audienceType,
		presentationType,
		budget,
		cateringComment,
		souvenirsAndPrintedProductsComment,
		attendees,
		generalComment,
		author,
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