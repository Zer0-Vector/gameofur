export default class BaseImage {
  constructor(prefix, name) {
    this.prefix = prefix
    this.name = name
  }

  className() {
    return this.prefix + '-' + this.name
  }
}
