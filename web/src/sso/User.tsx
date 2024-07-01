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

  public toPrompt(): string {
    let s = ''
    this.username && (s += `My name is ${this.username}, \n\n`)
    this.email && (s += `my email address is ${this.email}, \n\n`)
    this.position && (s += `我的职位是 ${this.position}, \n\n`)
    this.employeeId && (s += `我登录钉钉的账号名是 ${this.employeeId}, \n\n`)
    this.raw && (s += `I am ${this.raw}\n\n`)
    return s
  }
}