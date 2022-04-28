import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchEventsStatistics } from 'reducers/events/events-slice';
import { eventsStatisticsSelector } from 'reducers/events/selectors';
import { isAdminSelector } from 'reducers/user/selectors';

import { createLinkMethods } from 'utils/eventsInfoLinkUtil';
import { getTestId } from 'utils';

import { CONTAINER_NAMES, COMPONENTS_IDS } from 'constants/commonConstants';
import { eventsInfoList } from 'constants/eventsInfoItems';

import { DASHBOARD_TITLES } from 'constants/dashboardConstants';
import styles from './EventsInfo.module.scss';
import EventsInfoItem from './components/EventsInfoItem/EventsInfoItem';
import EventsManagementLink from './components/EventsManagementLink/EventsManagementLink';

const EventsInfo = () => {
	const statisticsList = useSelector(eventsStatisticsSelector);
	const isAdmin = useSelector(isAdminSelector);

	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(fetchEventsStatistics());
	}, []);

	return (
		<div
			className={styles.container}
			data-testid={getTestId(CONTAINER_NAMES.dashboard, COMPONENTS_IDS.eventsInfoTabs)}
		>
			{eventsInfoList.map(({ img, color, link, title, statisticsKey }, index) => (
				<EventsInfoItem
					key={`${title}-${index}`}
					img={img}
					color={color}
					link={
						link.value || (createLinkMethods[link.method](link?.status) || createLinkMethods[link.method]())
					}
					title={title}
					statisticsValue={statisticsList[statisticsKey]}
					testId={getTestId(CONTAINER_NAMES.dashboard, COMPONENTS_IDS[statisticsKey])}
					isToFixedDigits={DASHBOARD_TITLES.RATING === title}
				/>
			))}

			{isAdmin && EventsManagementLink}
		</div>
	);
};

export default EventsInfo;



