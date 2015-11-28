const LoginForm = React.createClass({
  getInitialState: function() {
    return {
      username: '',
      password: '',
      remember: false,
      errorMessage: ''
    };
  },
  handleChange: function(field, evt) {
    var diff = {};
    diff[field] = evt.target.value;
    this.setState(diff);
  },
  handleChangeRemember: function(evt) {
    this.setState({remember: evt.target.checked});
  },
  canSubmit: function() {
    return (this.state.username.trim())&&(this.state.password.trim());
  },
  handleSubmit: function(type, evt) {
    evt.preventDefault();
    var data = {
      username: this.state.username.trim(),
      password: this.state.password,
      remember: this.state.remember
    };
    if (this.canSubmit()) {
      if (type == 'login') {
        this.login(data);
      } else {
        this.register(data);
      }
    }
  },
  login: function(data) {
    $.post('/login', data,
      function(res) {
        if (res.success) {
          this.setState({errorMessage: ''});
          window.location.replace('/');
        } else {
          this.setState({errorMessage: res.errorMessage});
        }
      }.bind(this));
  },
  register: function(data) {
    $.post('/register', data,
      function(res) {
        if (res.success) {
          this.setState({errorMessage: ''});
          this.login(data);
        } else {
          this.setState({errorMessage: res.errorMessage});
        }
      }.bind(this));
  },
  render: function() {
    var disable = this.canSubmit()? '': ' disabled';
    return (
      <form className="form-login">
        {this.state.errorMessage?<div className="alert alert-danger">{this.state.errorMessage}</div>:''}
        <h2 className="form-login-heading">Please login</h2>
        <TextInput
          name="username"
          default={this.state.username}
          onChange={this.handleChange.bind(this, 'username')}/>
        <PasswordInput
          name="password"
          default={this.state.password}
          onChange={this.handleChange.bind(this, 'password')}/>
        <div className="checkbox">
          <label>
            <input
              type="checkbox"
              checked={this.state.remember}
              onChange={this.handleChangeRemember}/>
            Remember me for one month
          </label>
        </div>
        <div className="btn-group btn-group-justified" role="group">
          <div className="btn-group" role="group">
            <button
              className={'btn btn-primary'+disable}
              onClick={this.handleSubmit.bind(this, 'login')}
              type="submit">Login</button>
          </div>
          <div className="btn-group" role="group">
            <button
              className={'btn btn-success'+disable}
              onClick={this.handleSubmit.bind(this, 'register')}
              type="submit">Register</button>
          </div>
        </div>
      </form>
    );
  }
});

ReactDOM.render(
  <LoginForm />,
  document.getElementById('content')
);
