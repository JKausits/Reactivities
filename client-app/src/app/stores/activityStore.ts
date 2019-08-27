import { observable, action, computed, configure, runInAction } from 'mobx';
import { createContext, SyntheticEvent } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';
import { history } from '../..';
import { toast } from 'react-toastify';

configure({ enforceActions: 'always' });
class ActivityStore {
  @observable activityRegistry = new Map();
  @observable loadingInitial = false;
  @observable activity: IActivity | null = null;
  @observable submitting = false;
  @observable target = '';

  getActivity = (id: string) => this.activityRegistry.get(id);

  @computed get activitiesByDate() {
    return this.groupActivitiesByDate(
      Array.from(this.activityRegistry.values())
    );
  }

  groupActivitiesByDate(activities: IActivity[]) {
    const sortedActivities = activities.sort(
      (a, b) => a.date!.getTime() - b.date!.getTime()
    );
    return Object.entries(
      sortedActivities.reduce(
        (activities, activity) => {
          const date = activity.date.toISOString().split('T')[0];
          activities[date] = activities[date]
            ? [...activities[date], activity]
            : [activity];
          return activities;
        },
        {} as { [key: string]: IActivity[] }
      )
    );
  }

  @action loadActivites = async () => {
    this.loadingInitial = true;
    try {
      const activities = await agent.Activities.list();
      runInAction('loading activities', () => {
        activities.forEach(activity => {
          activity.date = new Date(activity.date);
          this.activityRegistry.set(activity.id, activity);
        });
        this.loadingInitial = false;
      });
    } catch (error) {
      runInAction('load activites error', () => {
        this.loadingInitial = false;
      });
      console.error(error);
    }
  };

  @action loadActivity = async (id: string) => {
    let activity = this.activityRegistry.get(id);
    if (activity) {
      this.activity = activity;
      return activity;
    } else {
      this.loadingInitial = true;
      try {
        activity = await agent.Activities.details(id);
        runInAction('getting activity', () => {
          activity.date = new Date(activity.date);
          this.activity = activity;
          this.activityRegistry.set(activity.id, activity);
          this.loadingInitial = false;
        });
        return activity;
      } catch (error) {
        runInAction('get activity error', () => {
          this.loadingInitial = false;
        });
        console.error(error);
      }
    }
  };

  @action selectActivity = (id: string) => {
    this.activity = this.activityRegistry.get(id);
  };

  @action createActivity = async (activity: IActivity) => {
    this.submitting = true;

    try {
      await agent.Activities.create(activity);
      runInAction('creating activity', () => {
        this.activityRegistry.set(activity.id, activity);
        this.activity = activity;
        this.submitting = false;
      });
      history.push(`/activities/${activity.id}`);
    } catch (error) {
      runInAction('create activity error', () => {
        this.submitting = false;
      });
      toast.error('Problem submitting data');
      console.error(error);
    }
  };

  @action editActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.update(activity);
      runInAction('editing activity', () => {
        this.activityRegistry.set(activity.id, activity);
        this.activity = activity;
        this.submitting = false;
        history.push(`/activities/${activity.id}`);
      });
    } catch (error) {
      runInAction('edit activity error', () => {
        this.submitting = false;
      });
      toast.error('Problem submitting data');
      console.error(error);
    }
  };

  @action clearActivity = () => {
    this.activity = null;
  };

  @action deleteActivity = async (
    e: SyntheticEvent<HTMLButtonElement>,
    id: string
  ) => {
    this.submitting = true;
    this.target = e.currentTarget.name;
    try {
      await agent.Activities.delete(id);
      runInAction('deleting activity', () => {
        this.activityRegistry.delete(id);
        this.submitting = false;
      });
    } catch (error) {
      runInAction('delete activity error', () => {
        this.submitting = false;
      });
      console.error(error);
      toast.error('Problem submitting data');
    }
  };
}

export default createContext(new ActivityStore());
