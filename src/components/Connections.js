import React from 'react'
import { connect } from 'react-redux'
import { connect as connectJet, close as closeJet } from 'redux-jet'
import * as actions from '../actions'
import { Icon, List, Row } from 'hbm-react-components'
import classNames from 'classnames'
import url from 'url'
import { withRouter } from 'react-router'
import { Split, SplitRight, SplitLeft } from './Split'

const isValidWebSocketUrl = (urlString) => {
  try {
    const protocol = url.parse(urlString).protocol
    return protocol === 'ws:' || protocol === 'wss:'
  } catch (_) {
    return false
  }
}

const Connections = ({
  connection,
  connections,
  connectJet,
  children,
  closeJet,
  router,
  addConnection,
  removeConnection,
  changeConnection,
  selectConnection}) => {
  const isCurrentConnection = (con) => {
    return connection &&
      connection.url === con.url &&
      connection.user === con.user &&
      connection.isConnected
  }

  const toConnectionRow = (con, index) => {
    const remove = () => {
      if (isCurrentConnection(con)) {
        closeJet(con)
      }
      removeConnection(index)
    }
    const onSelect = () => {
      router.push('/connections/' + index)
    }
    let avatar
    let subtitle
    if (isValidWebSocketUrl(con.url)) {
      const isConnected = isCurrentConnection(con)
      avatar = isConnected ? <Icon.CloudDone className='Icon' /> : <Icon.CloudOff className='Icon' />

      subtitle = isConnected ? 'Connected' : 'Disconnected'
    } else {
      avatar = <Icon.Report className='Icon' />
      subtitle = 'Not configured'
    }
    const icon = <Icon.RemoveCircle onClick={remove} className='Icon Icon-Remove' />
    return <Row avatar={avatar}
      primary={con.name || con.url || 'New Connection'}
      secondary={subtitle}
      icon={icon}
      onFocus={onSelect}
      key={index} />
  }

  return (
    <Split className='Connections'>
      <SplitLeft>
        <List>
          <Row primary='Connections' />
          {connections.map(toConnectionRow)}
          <Row primary='' avatar={<span />} icon={<Icon.AddCircle className='Icon Connections-add Icon-Add' onClick={addConnection} />} />
        </List>
      </SplitLeft>
      <SplitRight>
        {children}
      </SplitRight>
    </Split>
  )
}

const mapStateToProps = (state) => {
  return {
    connections: state.settings.connections,
    connection: state.settings.connection
  }
}

export default withRouter(connect(mapStateToProps, {...actions, connectJet, closeJet})(Connections))
