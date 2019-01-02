import React from 'react';
import { withI18n } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'mdbreact';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Tabs } from '../../controls/Tabs';
import { CampBasicInfo } from './CampBasicInfo';
import { CampBasicDetails } from './CampBasicDetails';
import { CampFiles } from './CampFiles';
import { CampMembers } from './CampMembers';
import { CampSuppliers } from './CampSuppliers';

@observer
class BaseCampEdit extends React.Component {

    @observable
    activeTab = 1;

    constructor(props) {
        super(props);
        if (props.location.hash) {
            this.setActiveTab(props.location.hash.replace('#', ''))
        }
    }

    setActiveTab(tab) {
        tab = +tab;
        if (this.activeTab !== tab) {
            this.activeTab = tab;
            this.props.history.push({hash: `#${tab}`, search: this.props.location.search})
        }
    }

    saveChanges(editedCamp) {
        const savedCamp = {
            ...this.props.camp,
            ...editedCamp
        }
        // TODO - send to BE.
    }

    render() {
        const {t, camp} = this.props;
        const tabs = [
            {
                id: 1,
                title: t('camps:camp.edit.tabs.info'),
                component: <CampBasicInfo key={1} camp={camp} onSave={this.saveChanges} />
            },
            {
                id: 2,
                title: t('camps:camp.edit.tabs.details'),
                component: <CampBasicDetails key={2} camp={camp} onSave={this.saveChanges} />
            },
            {
                id: 3,
                title: t('camps:camp.edit.tabs.members'),
                component: <CampMembers key={3} camp={camp} onSave={this.saveChanges} />
            },
            {
                id: 4,
                title: t('camps:camp.edit.tabs.files'),
                component: <CampFiles key={4} camp={camp} onSave={this.saveChanges} />
            },
            {
                id: 5,
                title: t('camps:camp.edit.tabs.suppliers'),
                component: <CampSuppliers key={5} camp={camp} onSave={this.saveChanges} />
            }
        ];

        return (
            <div>
                <Row>
                    <Col md="12">
                        <Tabs tabs={tabs} selectedId={this.activeTab} onSelect={(e) => this.setActiveTab(e)}/>
                    </Col>
                </Row>
            </div>
        );
    }
}

export const CampEdit = withRouter(withI18n()(BaseCampEdit));