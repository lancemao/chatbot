export default class User {
  public id: string
  public username: string
  public email: string
  public firstName: string
  public lastName: string
  public avatar: string

  public onIconClick: () => void

  constructor(id: string) {
    this.id = id
  }

  public static Guest = new User('guest')
}