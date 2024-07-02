export default class User {
  public id: string
  public username: string
  public email: string
  public nickname: string
  public mobile: string
  public employeeId: string
  public department: string
  public hiredDate: string
  public position: string
  public avatar: string
  public raw: string // json string from backend

  public onIconClick: () => void

  constructor(id: string) {
    this.id = id
  }

  public static Guest = new User('guest')
}