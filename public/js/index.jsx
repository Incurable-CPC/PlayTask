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
        <User achievement={this.state.achievement}/>
        <TabList
          type={this.state.type}
          content={this.state.content}
          onClick={this.handleOnClick} />
        {content}
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
        <TaskEditModal
          action={this.state.action}
          task={this.state.taskEditing}
          onChange={this.handleChange}
          workTask={this.workTask} />
        <TaskNewButton
          type={this.props.type}
          showEditModal={this.showEditModal.bind(this, 'new')}
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
const TaskEditModal = React.createClass({
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
  onClick: function() {
    var defaultTask = {type: this.props.type};
    this.props.showEditModal(defaultTask);
  },
  render: function () {
    return (
      <div className="text-right">
        <button
          type="button"
          className="btn btn-primary"
          onClick={this.onClick}>
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
        <DesireEditModal
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
const DesireEditModal = React.createClass({
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
        <EventViewModal
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
const EventViewModal = React.createClass({
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

var clearUserEditModalMessage;
const User = React.createClass({
  getInitialState: function() {
    return {
      image: '',
      nickname: ''
    };
  },
  showEditModal: function() {
    $('#user-edit-modal').modal('show');
    clearUserEditModalMessage();
  },
  componentDidMount: function() {
    this.loadFromServer();
  },
  loadFromServer: function() {
    $.get('/api/user/get', function(user) {
      this.setState({
        nickname: user.nickname,
        image: '/img/'+user.image
      });
    }.bind(this));
  },
  changeNickname: function(evt) {
    var nickname = evt.target.value;
    this.setState({nickname: nickname});
    $.post('/api/user/nickname/edit',
      {nickname: nickname},
      this.loadFromServer);
  } ,
  render: function() {
    return (
      <div>
        <UserInfo
          image={this.state.image}
          onClick={this.showEditModal}
          nickname={this.state.nickname}
          achievement={this.props.achievement}/>
        <UserEditModal
          changeNickname={this.changeNickname}
          onUpdate={this.loadFromServer}
          nickname={this.state.nickname}
          image={this.state.image} />
      </div>
    );
  }
})
const UserInfo = React.createClass({
  render: function() {
    return (
      <div className="well well-lg">
        <div className="media">
          <div className="media-left">
            <a href={emptyUrl} onClick={this.props.onClick}>
              <img
                className="media-object"
                src={this.props.image}
                style={{height: '150px', width: '150px'}}/>
            </a>
          </div>
          <div className="media-body">
            <br />
            <h2 className="media-heading">{this.props.nickname}</h2>
            <br />
            <Achievement achievement={this.props.achievement}/>
          </div>
        </div>
      </div>
    );
  }
});
const Achievement = React.createClass({
  render: function() {
    var achievement = this.props.achievement;
    var state = (achievement >= 0)? 'success': 'danger';
    return (
      <h2 className={'text-'+state}>
        <strong>Achievement: {this.props.achievement}</strong>
      </h2>
    );
  }
});
const UserEditModal = React.createClass({
  getInitialState() {
    return {
      state: 'success',
      message: ''
    };
  },
  setMessage: function(msg) {
    this.setState(msg);
  },
  render: function() {
    var state = this.state.state;
    var message = this.state.message;
    clearUserEditModalMessage = function() {
      this.setState({message: ''});
    }.bind(this);
    return (
      <div className="modal fade" id="user-edit-modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 className="modal-title">User Info</h4>
            </div>
            <div className="modal-body">
              {message?<div className={'alert alert-'+state}>{message}</div>: ''}
              <form className="form-horizontal">
                <div className="form-group">
                  <label htmlFor="nickname-input" className="col-sm-3 control-label">Nickname</label>
                  <div className="col-sm-4">
                    <TextInput
                      name="nickname"
                      default={this.props.nickname}
                      onChange={this.props.changeNickname}/>
                  </div>
                </div>
              </form>
              <hr />
              <UserImageUpload
                image={this.props.image}
                setMessage={this.setMessage}
                onUpdate={this.props.onUpdate}/>
            </div>
            <div className="modal-footer">
              <a className="btn btn-danger" type="button" href="/logout">Logout</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
const UserImageUpload = React.createClass({
  getInitialState: function() {
    return {
      image: null,
      changed: false
    };
  },
  handleImageChange: function(files) {
    this.setState({
      image: files? files[0]: null,
      changed: true
    });
  },
  uploadImage: function() {
    if (!this.state.changed) return;
    if (this.state.image.size > 2*1024*1024) {
      this.props.setMessage({
        state: 'danger',
        message: 'File should be smaller than 2MB'
      });
      return;
    }
    var data = new FormData();
    data.append('image', this.state.image);
    $.ajax({
      type: 'post',
      url: '/api/user/picture/upload',
      data: data,
      enctype: 'multipart/form-data',
      processData: false,
      contentType: false,
      success: function() {
        this.props.onUpdate();
        this.setState({changed: false});
        this.props.setMessage({
          state: 'success',
          message: 'Upload image success'
        })
      }.bind(this)
    });
  },
  render: function() {
    return (
      <div className="row">
        <div className="col-sm-3">
          <img className="pull-right" src={this.props.image} style={{height: '80px', width: '80px'}}/>
        </div>
        <div className="col-sm-9">
          <label htmlFor="picture-input">Upload new picture</label>
          <form className="form-inline">
            <div className="form-group">
              <FileInput
                name="picture"
                accept="image/*"
                onChange={this.handleImageChange}/>
            </div>
            <div className="form-group">
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.uploadImage}>Upload</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
});

ReactDOM.render(
  <Content />,
  document.getElementById('content')
);