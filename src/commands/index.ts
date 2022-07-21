import add from './add/add'
import run from './run/run'
import init from './init/init'
import remove from './remove/remove'
import initYield from './init/initYield'

class commandManager {
  add(packageToInstall: string, currentWorkingDirectory: string) {
    add(packageToInstall, currentWorkingDirectory)
  }
  run(command: string, currentWorkingDirectory: string) {
    run(command, currentWorkingDirectory)
  }

  init(command: string, currentWorkingDirectory: string, version: string) {
    init(command, currentWorkingDirectory, version)
  }

  initYield(currentWorkingDirectory: string) {
    initYield(currentWorkingDirectory)
  }

  remove(command: string, currentWorkingDirectory: string) {
    remove(command, currentWorkingDirectory)
  }
}

export default commandManager