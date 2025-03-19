import * as React from 'react'
import Typography from '@material-ui/core/Typography'
import { COMMANDS } from '../fetch/fetch'
import { TimeUtil } from './TimeUtil'
import { UnitsUtil } from './UnitsUtil'

const SYSTEM_INFO_URL = '/admin/jolokia/read/java.lang:type=Runtime/'
const OPERATING_SYSTEM_URL =
  '/admin/jolokia/read/java.lang:type=OperatingSystem/'

type SystemInfoType = {
  startTime: string
  uptime: string
  runtime: string
  runtimeVersion: string
  systemInformation: {
    VmName: string
    VmVersion: string
  }
  operatingSystem: {
    AvailableProcessors: string
  }
  totalMemory: string
  usedMemory: string
  freeMemory: string
}

type ModeType = 'loading' | 'normal'
export const SystemInformation = () => {
  const [systemInfo, setSystemInfo] = React.useState({} as SystemInfoType)
  const [mode, setMode] = React.useState('loading' as ModeType)
  React.useEffect(() => {
    if (mode === 'loading') {
      COMMANDS.FETCH(SYSTEM_INFO_URL)
        .then((response) => response.json())
        .then((systemInfoData) => {
          COMMANDS.FETCH(OPERATING_SYSTEM_URL)
            .then((response) => response.json())
            .then((operatingInfoData) => {
              var systemData = systemInfoData.value
              var operatingSystemData = operatingInfoData.value
              var uptime = TimeUtil.convertUptimeToString(systemData.Uptime)
              var usedMemory = UnitsUtil.convertBytesToDisplay(
                operatingSystemData.TotalPhysicalMemorySize -
                  operatingSystemData.FreePhysicalMemorySize
              )
              var totalMemory = UnitsUtil.convertBytesToDisplay(
                operatingSystemData.TotalPhysicalMemorySize
              )
              var freeMemory = UnitsUtil.convertBytesToDisplay(
                operatingSystemData.FreePhysicalMemorySize
              )
              var startTime = new Date(systemData.StartTime).toLocaleString()

              setSystemInfo({
                systemInformation: systemData,
                operatingSystem: operatingSystemData,
                startTime: startTime,
                uptime: uptime,
                usedMemory: usedMemory,
                totalMemory: totalMemory,
                freeMemory: freeMemory,
                runtime: systemData.SystemProperties['java.runtime.name'],
                runtimeVersion:
                  systemData.SystemProperties['java.runtime.version'],
              })
              setMode('normal')
            })
        })
    }
  }, [mode])

  switch (mode) {
    case 'loading':
      return (
        <>
          <Typography variant="h4" align="center">
            <span className="fa fa-refresh fa-spin fa-5x" />
            <div>Loading System Information</div>
          </Typography>
        </>
      )
    case 'normal':
    default:
      const {
        startTime,
        uptime,
        runtime,
        runtimeVersion,
        systemInformation,
        operatingSystem,
        totalMemory,
        usedMemory,
        freeMemory,
      } = systemInfo
      return (
        <>
          <div className="information-category">
            <h3>System</h3>
            <div
              className="information-row"
              title="System -> Last started: {{startTime}}"
            >
              <div className="row-label">Last Started</div>
              <div className="row-value">{startTime}</div>
            </div>
            <div
              className="information-row"
              title="System -> Uptime: {{uptime}}"
            >
              <div className="row-label">Uptime</div>
              <div className="row-value">{uptime}</div>
            </div>
          </div>
          <div className="information-category">
            <h3>Java</h3>
            <div
              className="information-row"
              title="Java -> Java Runtime: {{runtime}} (build {{runtimeVersion}})"
            >
              <div className="row-label">Java Runtime</div>
              <div className="row-value">
                {runtime} (build {runtimeVersion})
              </div>
            </div>
            <div
              className="information-row"
              title="Java -> Java Virtual Machine: {{systemInformation.VmName}} (build {{systemInformation.VmVersion}})"
            >
              <div className="row-label">Java Virtual Machine</div>
              <div className="row-value">
                {systemInformation.VmName} (build {systemInformation.VmVersion})
              </div>
            </div>
            <div
              className="information-row"
              title="Java -> Number of Processors: {{operatingSystem.AvailableProcessors}}"
            >
              <div className="row-label">Number of Processors</div>
              <div className="row-value">
                {operatingSystem.AvailableProcessors}
              </div>
            </div>
            <div
              className="information-row"
              title="Java -> Total Memory: {{totalMemory}}"
            >
              <div className="row-label">Total Memory</div>
              <div className="row-value">{totalMemory}</div>
            </div>
            <div
              className="information-row"
              title="Java -> Used Memory: {{usedMemory}}"
            >
              <div className="row-label">Used Memory</div>
              <div className="row-value">{usedMemory}</div>
            </div>
            <div
              className="information-row"
              title="Java -> Free Memory: {{freeMemory}}"
            >
              <div className="row-label">Free Memory</div>
              <div className="row-value">{freeMemory}</div>
            </div>
          </div>
        </>
      )
  }
}
