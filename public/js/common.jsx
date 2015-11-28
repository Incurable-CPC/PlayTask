/**
 * Created by Cai on 11/20/2015.
 */
Date.prototype.format = function (fmt) {
  var o = {
    'M+': this.getMonth()+1,
    'd+': this.getDate(),
    'h+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'q+': Math.floor((this.getMonth()+3)/3),
    'S': this.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4-RegExp.$1.length));
  for (var k in o) if (o.hasOwnProperty(k))
    if (new RegExp("("+k+")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00"+o[k]).substr(("" + o[k]).length)));
  return fmt;
};

window.nameStr = function(name) {
  return name.substr(0, 1).toUpperCase().concat(name.substr(1));
};
window.emptyUrl = 'javascript: void(0)';

const Input = React.createClass({
  render: function() {
    var name = this.props.name;
    return (
      <div>
        <label htmlFor={name+'-input'} className="sr-only">{nameStr(name)}</label>
        <input
          className="form-control"
          type={this.props.type}
          name={name}
          id={name+'-input'}
          placeholder={nameStr(name)}
          value={this.props.default}
          onChange={this.props.onChange} />
      </div>
    );
  }

});
window.TextInput = React.createClass({
  render: function() {
    return <Input {...this.props} type="text"/>;
  }
});
window.PasswordInput = React.createClass({
  render: function() {
    return <Input {...this.props} type="password"/>;
  }
});
window.Select = React.createClass({
  render: function() {
    var name=this.props.name;
    var options = this.props.options.map(function(option) {
      return (
        <option
          key={option.value}
          value={option.value}>
          {option.text}</option>
      );
    }, this);
    return (
      <select
        className="form-control"
        onChange={this.props.onChange}
        value={this.props.default}
        name={name}
      >{options}</select>
    );
  }
});
