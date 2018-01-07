import sha1 = require("sha1");

declare global  {
  export interface String {
      rightOf(s: string): string;
      leftOf(s: string): string;
      rightRightOf(s: string): string;
      removeEnd(s: string, caseInsensistive: boolean): string;
      stripAccents(): string;
      sha1(): string;
      hashCode(): number;
      contains(s: string): boolean;
  }
}

String.prototype.rightOf = function (search) {
    var index = this.indexOf(search);
    if (index > -1)
        return this.substring(index + search.length, this.length);
    else
        return "";
};
String.prototype.rightRightOf = function (souschaine) {
    var index = this.lastIndexOf(souschaine);
    if (index > -1)
        return this.substr(index + souschaine.length);
    else
        return "";
};
String.prototype.stripAccents = function () {
    var translate_re = /[àáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ]/g;
    var translate = 'aaaaaceeeeiiiinooooouuuuyyAAAAACEEEEIIIINOOOOOUUUUY';
    return (this.replace(translate_re, function (match) {
        return translate.substr(translate_re.source.indexOf(match) - 1, 1);
    }));
};
String.prototype.sha1 = function () {
    return sha1(this);
};
String.prototype.hashCode = function () {
    var hash = 0;
    var i, c;
    if (this.length == 0)
        return hash;
    for (i = 0; i < this.length; i++) {
        c = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + c;
        hash = hash & hash;
    }
    return hash;
};
String.prototype.contains = function (it) {
    return this.indexOf(it) > -1;
};
String.prototype.leftOf = function (souschaine) {
    var index = this.indexOf(souschaine, 0);
    if (index >= 0)
        return this.substring(0, index);
    else
        return '';
};
String.prototype.removeEnd = function (s, caseInsensistive = false) {
    if (this.endsWith(s, caseInsensistive))
        return this.substring(0, this.length - s.length);
    else
        return this.toString();
};
