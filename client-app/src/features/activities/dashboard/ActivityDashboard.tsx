import React, { useEffect, useContext } from 'react';
import { Grid } from 'semantic-ui-react';
import ActivityList from './ActivityList';
import { observer } from 'mobx-react-lite';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import ActivityStore from '../../../app/stores/activityStore';

const ActivityDashboard: React.FC = () => {
  const activityStore = useContext(ActivityStore);
  useEffect(() => {
    activityStore.loadActivites();
  }, [activityStore]);

  if (activityStore.loadingInitial) {
    return <LoadingComponent content='Loading activities...' />;
  }
  return (
    <Grid>
      <Grid.Column width={10}>
        <ActivityList />
      </Grid.Column>
      <Grid.Column width={6}>
        <h2>Activity filters</h2>
      </Grid.Column>
    </Grid>
  );
};

export default observer(ActivityDashboard);
