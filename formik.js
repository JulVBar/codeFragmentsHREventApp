export const RequestForm = ({
	eventType,
	user,
	transferTypes,
	supportTypes,
	locations,
	cities,
	startDate,
	getEventDateLimit,
	handleRequestFormSubmit,
	isEditForm,
	isCompletedEventForm,
}) => {
	const dispatch = useDispatch();
	const { isModerator, isAdmin } = user;
	const newEventTitle = RequestFormTitle[isModerator || isAdmin ? 'CREATE_EVENT' : 'REQUEST_EVENT'];
	const filteredEventTypesByRole = useSelector(filteredEventsByRoleSelector);
	const filteredEventTypesNamesByRole = useSelector(filteredEventTypesNamesByRoleSelector);
	const combinedModeratorList = useSelector(combinedModeratorListSelector);
	const event = useSelector(eventSelector);
	const analyticsInfo = event?.analyticsInfo;
	const { isCopying } = useSelector(eventStateSelector);
	const statuses = useSelector(state => statusesRulesSelector(state, event?.eventStatus));
	const isDraftEvent = event?.eventStatus === EVENT_STATUSES.draft;
	const [isDraftForm, setIsDraftForm] = useState(false);
	const [isDraftToEventRequest, setIsDraftToEventRequest] = useState(false);
	useEffect(() => () => dispatch(resetFiles()), []);

	const getFormTitle = () => {
		if (isEditForm) {
			return RequestFormTitle.EDIT_EVENT;
		}
		if (isCompletedEventForm) {
			return RequestFormTitle.ADD_INFO_TO_EVENT;
		}
		return newEventTitle;
	};

	const getInitialValues = useCallback(() => {
		if (isEditForm || isCompletedEventForm) {
			return setEditEventFormSidebarFields(event);
		}
		if (isCopying) {
			return setCopyEventFormSubmit(event);
		}
		return requestFormInitialValues(eventType);
	}, [event]);

	const handleSubmit = useCallback(
		(values, { resetForm }) => {
			if (isEditForm || isCompletedEventForm) {
				handleEventFormSubmit(
					values,
					{
						locations,
						cities,
						eventTypes: filteredEventTypesByRole,
						transferTypes,
						supportTypes,
						combinedModeratorList,
						isDraft: isDraftForm,
						isDraftToEventRequest,
					},
					dispatch,
				);
			} else {
				handleRequestFormSubmit(values, {
					locations,
					cities,
					eventTypes: filteredEventTypesByRole,
					transferTypes,
					supportTypes,
					user,
					isDraft: isDraftForm,
				});
			}
			resetForm({ values: '' });
		},
		[isDraftForm, event, isDraftToEventRequest],
	);

	if ((isEditForm || isCompletedEventForm) && !event) {
		return <Spinner />;
	}

	if (isEditForm && !event) {
		return <Spinner />;
	}

	const initialValues = getInitialValues();

	return (
		<>
			<Formik
				initialValues={initialValues}
				validationSchema={() =>
					createValidationSchema({
						isModerator,
						isAdmin,
						isDraftForm,
						isCompletedEventForm,
						filteredEventTypesNamesByRole,
					})
				}
				onSubmit={handleSubmit}
			>
				{props => {
					return (
						<Form className={styles.requestForm}>
							<p className={styles.formTitle}>{getFormTitle()}</p>
							<div className={styles.body}>
								<Fields
									user={user}
									eventTypes={filteredEventTypesByRole}
									transferTypes={transferTypes}
									supportTypes={supportTypes}
									locations={locations}
									cities={cities}
									startDate={startDate}
									getEventDateLimit={getEventDateLimit}
									formikProps={props}
									isEditForm={isEditForm}
									isCompletedEventForm={isCompletedEventForm}
									combinedModeratorList={combinedModeratorList}
									statuses={statuses}
									containerName={REQUEST_FORM_NAME}
									isDraftEvent={isDraftEvent}
									setIsDraftForm={setIsDraftForm}
									setIsDraftToEventRequest={setIsDraftToEventRequest}
									isDraftToEventRequest={isDraftToEventRequest}
									analyticsInfo={analyticsInfo}
								/>
							</div>
						</Form>
					);
				}}
			</Formik>
		</>
	);
};