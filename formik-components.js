const Fields = ({
	formikProps,
	isEditForm,
	isCompletedEventForm,
	containerName,
	setIsDraftForm,
	analyticsInfo,
}) => {
	const {
		values: {
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

	const resetFormFields = useCallback(fields => {
		fields.forEach(field => setFieldValue(field, initialValues[field]));
	}, [])

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

	return (
		<>
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