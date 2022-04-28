
const SpeakersFieldArray = ({ speakers, setFieldValue, resetFormFields, containerName, requiredFields }) => {
	const dispatch = useDispatch();
	const telescopeUsers = useSelector(state => state.telescopeUsers);

	const handleUserInputChange = input => {
		dispatch(getTelescopeUsers(input));
	};

	const handleUsersRender = ({ upsaId, email, name }) => {
		const avatarUrl = getAvatarURL(upsaId);
		return (
			<div key={email} className={styles.dropdownItem}>
				<img src={avatarUrl} className={styles.dropdownImage} alt="organizer's avatar" />
				<div className={styles.dropdownText}>{name}</div>
			</div>
		);
	};

	const handleAddSpeaker = push => {
		push({
			name: '',
			rating: '',
			isExternal: false,
			email: '',
		});
	};

	return (
		<FieldArray name={REQUEST_FORM_FIELDS.speakers}>
			{({ remove, push }) => (
				<div>
					{speakers &&
						speakers.length > 0 &&
						speakers.map((item, index) => (
							<div key={index} className={styles.container}>
								<div className={styles.inputCheckboxContainer}>
									<div className={styles.formCheckbox}>
										<label>External speaker</label>
										<input
											className={styles.checkboxInput}
											type="checkbox"
											checked={item.isExternal}
											onChange={() => {
												setFieldValue(`speakers.${index}.isExternal`, !item.isExternal);
												resetFormFields([
													`speakers.${index}.rating`,
													`speakers.${index}.name`,
													`speakers.${index}.email`,
												]);
											}}
										/>
									</div>
									{item.isExternal ? (
										<TextInputWrapper
											name={`speakers.${index}.name`}
											containerName={containerName}
											title="Speaker"
											value={item.name}
											placeholder="Enter external speaker"
											onChange={value => setFieldValue(`speakers.${index}.name`, value)}
											requiredField={requiredFields.includes('speakers')}
										/>
									) : (
										<TypeheadInputWrapper
											title="Speaker"
											labelKey="name"
											options={telescopeUsers}
											defaultSelected={[
												{
													name: item.name ? item.name : '',
												},
											]}
											onInputChange={handleUserInputChange}
											onChange={value => {
												setFieldValue(`speakers.${index}.isExternal`, false);
												setFieldValue(`speakers.${index}.email`, value[0]?.email);
												setFieldValue(`speakers.${index}.name`, value[0]?.name);
											}}
											renderMenuItemChildren={handleUsersRender}
											placeholder="Select speaker"
											requiredField={requiredFields.includes('speakers')}
										/>
									)}
								</div>

								{item.isExternal && (
									<TextInputWrapper
										name={`speakers.${index}.email`}
										containerName={containerName}
										title="Email"
										value={item.email}
										placeholder="Enter email"
										onChange={value => setFieldValue(`speakers.${index}.email`, value)}
									/>
								)}

								<TextInputWrapper
									name={`speakers.${index}.rating`}
									containerName={containerName}
									title="Speaker's rating"
									value={item.rating}
									maxLength={4}
									placeholder="Enter rating from 0.00 to 5.00"
									onChange={value => setFieldValue(`speakers.${index}.rating`, value)}
									requiredField={requiredFields.includes('speakers')}
								/>
								<button type="button" className={styles.deleteSpeakerBtn} onClick={() => remove(index)}>
									delete speaker
								</button>
							</div>
						))}
					<button type="button" className={styles.addSpeakerBtn} onClick={() => handleAddSpeaker(push)}>
						+ add speaker
					</button>
				</div>
			)}
		</FieldArray>
	);
};

