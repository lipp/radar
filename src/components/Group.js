import React from 'react'
import { connect } from 'react-redux'
import * as actions from '../actions'
import { getFilteredStatesAndMethods } from '../reducers'
import * as jetActions from 'redux-jet'
import { withRouter } from 'react-router'
import { Icon } from 'md-components'
import classNames from 'classnames'
import StateAndMethodList from './StateAndMethodList'
import { Split, SplitRight, SplitLeft } from './Split'
import SearchBar from './SearchBar'

class Group extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      searchTermsChips: [],
      searchTerms: []
    }
  }

  updateFetch (groups, nextGroup) {
    let group = {...groups.find(group => group.title === nextGroup)}
    if (!group) {
      return
    }
    if (!this.fetching || this.lastGroup !== nextGroup) {
      this.lastGroup = nextGroup
      this.props.unfetch(this.props.connection, 'group')
      this.props.fetch(this.props.connection, group.expression, 'group')
      this.fetching = true
    }
  }

  componentWillMount () {
    if (!this.props.groups) {
      return
    }
    this.updateFetch(this.props.groups, decodeURIComponent(this.props.params.group))
  }

  componentWillReceiveProps (nextProps) {
    if (!nextProps.groups) {
      return
    }
    this.updateFetch(nextProps.groups, decodeURIComponent(nextProps.params.group))
  }

  componentWillUnmount () {
    this.props.unfetch(this.props.connection, 'group')
    this.fetching = false
  }

  onSelect = (stateOrMethod) => {
    this.props.router.push('/groups/' + encodeURIComponent(this.props.params.group) + '/' + encodeURIComponent(stateOrMethod.path))
  }

  onChange = (terms) => {
    this.setState({searchTermsChips: terms})
  }

  onSubmit = (event) => {
    event.preventDefault()
    this.props.setSelectedFields([])
    this.setState({searchTerms: this.state.searchTermsChips})
  }

  render () {
    const {statesAndMethods, toggleFavorite, favorites, children, selectedFields} = this.props

    const filteredStatesAndMethods = getFilteredStatesAndMethods(statesAndMethods, this.state.searchTerms || [])

    const createStar = (path) => {
      return <Icon.Star
        onClick={() => toggleFavorite(path)}
        className={classNames('Icon Fetch Star', {'Star--active': (favorites.indexOf(path) > -1)})}
      />
    }

    return (
      <Split className='Group'>
        <SplitLeft>
          <SearchBar
            onChange={this.onChange}
            onSubmit={this.onSubmit}
            terms={this.state.searchTermsChips}
            statesAndMethods={filteredStatesAndMethods}
            selectedFields={selectedFields}
          />
          <StateAndMethodList statesAndMethods={filteredStatesAndMethods} iconCreator={createStar} rootPath={'/groups/' + encodeURIComponent(this.props.params.group)} selectedFields={selectedFields} />
        </SplitLeft>
        <SplitRight>
          {children && React.cloneElement(children, {statesAndMethods})}
        </SplitRight>
      </Split>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    groups: state.data.groups,
    favorites: state.settings.favorites,
    statesAndMethods: state.data.group,
    connection: state.settings.connection,
    selectedFields: state.settings.selectedFields
  }
}

export default withRouter(connect(mapStateToProps, {...actions, ...jetActions})(Group))