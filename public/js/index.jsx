const Content = React.createClass({
  getInitialState: function() {
    return {
      content: 'task',
      type: 0,
      achievement: 0
    };
  },
  componentDidMount: function() {
    this.loadAchievementFromServer();
  },
  loadAchievementFromServer: function() {
    $.get('/api/achievement/get', function(data) {
      this.setState(data);
    }.bind(this));
  },
  handleOnClick: function(type, content) {
    var newState = this.state;
    newState.content = content;
    if (type >= 0) newState.type = type;
    this.setState(newState);
  },
  render: function() {
    var content = null;
    switch (this.state.content) {
      case 'task': content = (
        <Task
          type={this.state.type}
          updateAchievement={this.loadAchievementFromServer}/>
      ); break;
      case 'desire': content = (
        <Desire
          updateAchievement={this.loadAchievementFromServer}/>
      ); break;
      case 'event': content=(
        <Event
          updateAchievement={this.loadAchievementFromServer}/>
      ); break;
    }
    return (
      <div className="content">
        <Achievement achievement={this.state.achievement}/>
        <TabList
          type={this.state.type}
          content={this.state.content}
          onClick={this.handleOnClick} />
        {content}
      </div>
    );
  }
});

const Achievement = React.createClass({
  render: function() {
    var achievement = this.props.achievement;
    var state = (achievement >= 0)? 'success': 'danger';
    return (
      <div className={'text-center alert alert-'+state}>
        <strong>Achievement: {this.props.achievement}</strong>
      </div>
    );
  }
});

const TabList = React.createClass({
  render: function() {
    var tabs = ['desire', 'event'].map(function(name) {
      return (
        <Tab
          name={name}
          key={name}
          selected={this.props.content == name}
          onClick={this.props.onClick.bind(null, -1, name)} />
      );
    }, this);
    return (
      <ul className="nav nav-tabs nav-justified">
        <TabForTask
          type={this.props.type}
          onClick={this.props.onClick}
          selected={this.props.content == 'task'}/>
        {tabs}
      </ul>
    );
  }
});
const Tab = React.createClass({
  render: function() {
    var name = this.props.name;
    return (
      <li
        className={this.props.selected? 'active': ''}
        rol="presentation"
        onClick={this.props.onClick} ><a id={name} href={emptyUrl}
      >{nameStr(name)}</a></li>
    );
  }
});
const TabForTask = React.createClass({
  render: function() {
    const TYPE = ['daily', 'weekly', 'normal'];
    var lists = TYPE.map(function(name, index) {
      return (
        <li key={name}>
          <a href={emptyUrl} onClick={this.props.onClick.bind(null, index, 'task')}>{nameStr(name)} Task</a>
        </li>
      );
    }, this);
    var showName = nameStr(TYPE[this.props.type]);
    return (
      <li role="presentation" className={'dropdown'+(this.props.selected? ' active': '')}>
        <a
          className="dropdown-toggle" data-toggle="dropdown" href={emptyUrl} role="button"
          onClick={this.props.onClick.bind(null, -1, 'task')}
          aria-haspopup="true" aria-expanded="false"
        >{showName} Task <span className="caret"> </span></a>
        <ul className="dropdown-menu">
          {lists}
        </ul>
      </li>
    );
  }
});

const Task = React.createClass({
  getInitialState: function() {
    return {
      taskEditing: {},
      taskList: [],
      action: 'new'
    };
  },
  componentDidMount: function() {
    this.loadFromServer();
  },
  loadFromServer: function() {
    $.get('/api/task/get/'+this.props.type, function(taskList) {
      this.setState({taskList: taskList});
      this.props.updateAchievement();
    }.bind(this));
  },
  showEditModal: function(action, task) {
    this.setState({
      taskEditing: task,
      action: action
    });
    $("#task-edit-modal").modal('show');
  },
  handleChange: function(filed, evt) {
    var diff = {taskEditing: this.state.taskEditing};
    diff.taskEditing[filed] = evt.target.value;
    if (this.state.action == 'edit') {
      diff.taskEditing.amount = Math.max(diff.taskEditing.amount, diff.taskEditing.nowDone);
      this.setState(diff, this.workTask.bind(this, 'edit'));
    } else {
      this.setState(diff);
    }
  },
  workTask: function(action) {
    var url = '/api/task/'+action;
    $.post(url,
      {task: JSON.stringify(this.state.taskEditing)},
      this.loadFromServer);
  },
  render: function() {
    return (
      <div id="task">
        <TaskList
          taskList={this.state.taskList}
          onClick={this.showEditModal.bind(this, 'edit')}/>
        <TaskEdit
          action={this.state.action}
          task={this.state.taskEditing}
          onChange={this.handleChange}
          workTask={this.workTask} />
        <TaskNewButton
          type={this.props.type}
          onClick={this.showEditModal.bind(this, 'new')}
          onUpdate={this.loadFromServer}
        />
      </div>
    );
  }
});
const TaskList = React.createClass({
  render: function() {
    var taskList = this.props.taskList.map(function(task) {
      return (
        <TaskNode
          task={task}
          key={task._id}
          onClick={this.props.onClick.bind(null, task)}/>
      );
    }, this);
    return (
      <div className="list-group">
        {taskList}
      </div>
    )
  }
});
const TaskNode = React.createClass({
  render: function() {
    var task = this.props.task;
    var done = task.nowDone == task.amount;
    return (
      <a
        href={emptyUrl}
        onClick={this.props.onClick}
        className={"list-group-item"+(done? ' list-group-item-success':'')}>
        <div className="row">
          <span className="col-sm-8 text-left">
            <h4 className="list-group-item-heading">{task.description}</h4>
            <p className="list-group-item-text">{task.nowDone}/{task.amount}</p>
          </span>
          <span className="col-sm-4 text-right">
            <h4><span className="label label-success">+ {task.points}</span></h4>
          </span>
        </div>
      </a>
    );
  }
});
const TaskEdit = React.createClass({
  render: function() {
    var task = this.props.task;
    var action = this.props.action;
    var done = task.nowDone == task.amount;
    return (
      <div className="modal fade" id="task-edit-modal">
        <div className="modal-dialog modal-sm">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 className="modal-title">{nameStr(action)} Task</h4>
            </div>
            <div className="modal-body">
              <form>
                <TextInput
                  name="description"
                  default={task? task.description: ''}
                  onChange={this.props.onChange.bind(null, 'description')}/>
                <TextInput
                  name="points"
                  default={task? task.points: ''}
                  onChange={this.props.onChange.bind(null, 'points')}/>
                <TextInput
                  name="amount"
                  default={task? task.amount: ''}
                  onChange={this.props.onChange.bind(null, 'amount')}/>
                <Select
                  name="type"
                  default={task? task.type: 0}
                  onChange={this.props.onChange.bind(null, 'type')}
                  options={[
                        {text: 'Daily Task', value: 0},
                        {text: 'Weekly Task', value: 1},
                        {text: 'Normal Task', value: 2}]} />
              </form>
            </div>
            <div className="modal-footer">
              {(action == 'new')?(
              <button
                type="button"
                className="btn btn-primary"
                data-dismiss="modal"
                onClick={this.props.workTask.bind(null, 'new')}>New Task</button>):(
              <div>
                <button
                  type="button"
                  className="btn btn-danger"
                  data-dismiss="modal"
                  onClick={this.props.workTask.bind(null, 'remove')}>Delete</button>
                <button
                  type="button"
                  className={'btn btn-success'+(done?' disabled':'')}
                  data-dismiss="modal"
                  onClick={this.props.workTask.bind(null, 'complete')}>Complete</button>
              </div>)}
            </div>
          </div>
        </div>
      </div>
    );
  }
});
const TaskNewButton = React.createClass({
  shouldComponentUpdate: function(nextPros) {
    return this.props.type != nextPros.type;
  },
  componentDidUpdate: function() {
    this.props.onUpdate();
  },
  render: function () {
    return (
      <div className="text-right">
        <button
          type="button"
          className="btn btn-primary"
          onClick={this.props.onClick.bind(null, {type: this.props.type})}>
          New Task </button>
      </div>
    );
  }
});

const Desire = React.createClass({
  getInitialState: function() {
    return {
      desireEditing: {},
      desireList: [],
      action: 'new'
    }
  },
  componentDidMount: function() {
    this.loadFromServer();
  },
  loadFromServer: function() {
    $.get('/api/desire/get', function(desireList) {
      this.setState({desireList: desireList});
      this.props.updateAchievement();
    }.bind(this));
  },
  showEditModal: function(action, desire) {
    this.setState({
      desireEditing: desire,
      action: action
    });
    $("#desire-edit-modal").modal('show');
  },
  handleChange: function(filed, evt) {
    var diff = {desireEditing: this.state.desireEditing};
    diff.desireEditing[filed] = evt.target.value;
    if (this.state.action == 'edit') {
      diff.desireEditing.amount = Math.max(diff.desireEditing.amount, diff.desireEditing.nowDone);
      this.setState(diff, this.workDesire.bind(this, 'edit'));
    } else {
      this.setState(diff);
    }
  },
  workDesire: function(action) {
    $.post('/api/desire/'+action,
      {desire: JSON.stringify(this.state.desireEditing)},
      this.loadFromServer);
  },
  render: function() {
    return (
      <div id="desire">
        <DesireList
          desireList={this.state.desireList}
          onClick={this.showEditModal.bind(this, 'edit')}/>
        <DesireEdit
          action={this.state.action}
          desire={this.state.desireEditing}
          onChange={this.handleChange}
          workDesire={this.workDesire} />
        <DesireNewButton
          onClick={this.showEditModal.bind(this, 'new')}/>
      </div>
    );
  }
});
const DesireList = React.createClass({
  render: function() {
    var desireList = this.props.desireList.map(function(desire) {
      return (
        <DesireNode
          key={desire._id}
          desire={desire}
          onClick={this.props.onClick.bind(null, desire)}
        />
      );
    }, this);
    return (
      <div className="list-group">
        {desireList}
      </div>
    );
  }
});
const DesireNode = React.createClass({
  render: function() {
    var desire = this.props.desire;
    var lastDate = (desire.lastDate?
      new Date(desire.lastDate).format('yy-MM-dd hh:mm:ss'):
      'never');
    return (
      <a
        href={emptyUrl}
        className="list-group-item"
        onClick={this.props.onClick}>
        <div className="row">
          <span className="col-sm-8 text-left">
            <h4 className="list-group-item-heading">{desire.description}</h4>
            <p className="list-group-item-text">Last time: {lastDate}</p>
          </span>
          <span className="col-sm-4 text-right">
            <h4><span className="label label-danger">- {desire.points}</span></h4>
          </span>
        </div>
      </a>
    );
  }
});
const DesireEdit = React.createClass({
  render: function() {
    var desire = this.props.desire;
    var action = this.props.action;
    return (
      <div className="modal fade" id="desire-edit-modal">
        <div className="modal-dialog modal-sm">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 className="modal-title">{nameStr(action)} Desire</h4>
            </div>
            <div className="modal-body">
              <form>
                <TextInput
                  name="description"
                  default={desire? desire.description: ''}
                  onChange={this.props.onChange.bind(null, 'description')}/>
                <TextInput
                  name="points"
                  default={desire? desire.points: ''}
                  onChange={this.props.onChange.bind(null, 'points')}/>
              </form>
            </div>
            <div className="modal-footer">
              {(action == 'new')?(
              <button
                type="button"
                className="btn btn-primary"
                data-dismiss="modal"
                onClick={this.props.workDesire.bind(null, 'new')}>New Desire</button>):(
              <div>
                <button
                  type="button"
                  className="btn btn-danger"
                  data-dismiss="modal"
                  onClick={this.props.workDesire.bind(null, 'remove')}>Delete</button>
                <button
                  type="button"
                  className="btn btn-warning"
                  data-dismiss="modal"
                  onClick={this.props.workDesire.bind(null, 'enjoy')}>Enjoy</button>
              </div>)}
            </div>
          </div>
        </div>
      </div>
    );
  }
});
const DesireNewButton = React.createClass({
  render: function () {
    return (
      <div className="text-right">
        <button
          type="button"
          className="btn btn-primary"
          onClick={this.props.onClick.bind(null, {})}>
          New Desire </button>
      </div>
    );
  }
});

const Event = React.createClass({
  getInitialState: function() {
    return {
      eventViewing: {},
      eventList:[]
    };
  },
  componentDidMount: function() {
    this.loadFromServer();
  },
  loadFromServer: function() {
    $.get('/api/event/get', function(eventList) {
      this.setState({eventList: eventList});
      this.props.updateAchievement();
    }.bind(this));
  },
  showEventModal: function(event) {
    this.setState({
      eventViewing: event
    });
    $('#event-view-modal').modal('show');
  },
  removeEvent: function() {
    $.post('/api/event/remove',
      {event: JSON.stringify(this.state.eventViewing)},
      this.loadFromServer);
  },
  render: function() {
    return (
      <div id="event">
        <EventList
          onClick={this.showEventModal}
          eventList={this.state.eventList}
        />
        <EventView
          removeEvent={this.removeEvent}
          event={this.state.eventViewing}/>
      </div>
    )
  }
});
const EventList = React.createClass({
  render: function() {
    var eventList = this.props.eventList.map(function(event) {
      return (
        <EventNode
          key={event._id}
          event={event}
          onClick={this.props.onClick}/>
      );
    }, this);
    return (
      <div className="list-group">
        {eventList}
      </div>
    );
  }
});
const EventNode = React.createClass({
  render: function() {
    var event = this.props.event;
    var date = (new Date(event.date)).format('yy-MM-dd hh:mm:ss');
    var positive = event.points > 0;
    var sign = positive? '+': '-';
    return (
      <a
        href={emptyUrl}
        className="list-group-item"
        onClick={this.props.onClick.bind(null, event)}>
        <div className="row">
          <span className="col-sm-8 text-left">
            <h4 className="list-group-item-heading">{event.description}</h4>
            <p className="list-group-item-text">Time: {date}</p>
          </span>
          <span className="col-sm-4 text-right">
            <h4><span className={'label label-'+(positive? 'success': 'danger')}>
              {sign} {Math.abs(event.points)}
            </span></h4>
          </span>
        </div>
      </a>
    );
  }
});
const EventView = React.createClass({
  render: function() {
    var event = this.props.event;
    var date = (new Date(event.date)).format('yy-MM-dd hh:mm:ss');
    var sign = (event.points > 0)? '+': '-';
    return (
      <div className="modal fade" id="event-view-modal">
        <div className="modal-dialog modal-sm">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 className="modal-title">View Event</h4>
            </div>
            <div className="modal-body">
              <h5>{event.description}</h5>
              <p>Point: {sign} {Math.abs(event.points)}</p>
              <p>Time: {date}</p>
            </div>
            <div className="modal-footer">
              <div>
                <button
                  type="button"
                  className="btn btn-danger"
                  data-dismiss="modal"
                  onClick={this.props.removeEvent}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

ReactDOM.render(
  <Content />,
  document.getElementById('content')
);