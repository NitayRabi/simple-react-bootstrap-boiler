import React from 'react';
import { withI18n } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Row, Col } from 'mdbreact';
import { GroupsTable } from '../groups/GroupsTable';
import { GroupsService } from '../../services/groups';
import { ParsingService } from '../../services/parsing';
import { EventsService } from '../../services/events';
import { AuditService } from '../../services/audit';
import { ButtonGroup } from '../controls/ButtonGroup';
import * as constants from '../../../models/constants';
import './PresaleAdmin.scss';
import Moment from 'react-moment';
import { UsersService } from '../../services/users';
import { AllocationService } from '../../services/allocations';

@observer
class BasePresaleAdmin extends React.Component {

    parsingService = new ParsingService();
    groupService = new GroupsService();
    eventsService = new EventsService();
    auditService = new AuditService();
    usersService = new UsersService();
    allocationsService = new AllocationService();
    /**
     * We'll keep track of groups changed in order to send them on save.
     */
    @observable
    changes = {};

    @observable
    error;

    @observable
    groups = [];

    @observable
    audits = [];

    @observable
    auditedUser = [];

    @observable
    allocations = [];

    get lastAudit() {
        if (!this.audits || !this.audits.length || !this.audits[0]) {
            return;
        }
        return this.audits[0].createdAt;
    }

    constructor(props) {
        super(props);
        this.init(props);
    }

    componentWillReceiveProps(props) {
        this.init(props);
    };

    async init(props) {
        try {
            const {match} = props;
            this.groups = (await this.groupService.getAllGroups(this.parsingService.getGroupTypeFromString(match.params.groupType), this.eventsService.getFormerEventId())) || [];
            this.getGroupsMembersCount();
            this.getGroupsTickets();
            this.getGroupsFormerEventTickets();
            this.getGroupsAllocations();
            this.getAudits();
        } catch (e) {
            this.groups = [];
            // TODO - what do we do with errors?
            this.error = e;
        }
    }

    async getAudits() {
        try {
            this.audits = await this.auditService.getAudits(constants.AUDIT_TYPES.PRESALE_ALLOCATIONS_ADMIN);
            if (this.audits && this.audits[0]) {
                this.auditedUser = (await this.usersService.getUserNameById(this.audits[0].updated_by)) || {};
            }
        } catch (e) {
            // TODO - what do we do with errors
            console.warn(e.stack);
        }
    }

    /**
     * For displaying member count (for former event)
     * @returns {Promise<void>}
     */
    async getGroupsMembersCount() {
        for (const group of this.groups) {
            try {
                const members = await this.groupService.getCampsMembersCount(group.id);
                for (const member of members) {
                    if (member.status === 'approved_mgr') {
                        group.members_count = !isNaN(group.members_count) ? group.members_count++ : 1;
                    }
                }
            } catch (e) {
                // TODO - what do we do with errors?
                group.members_count = 0;
            }
        }
    }

    /**
     * For displaying ticket count (for this event)
     * @returns {Promise<void>}
     */
    async getGroupsTickets() {
        for (const group of this.groups) {
            try {
                const tickets = await this.groupService.getCampsMembersTickets(group.id);
                if (!tickets || !tickets.length) {
                    group.tickets = [];
                } else {
                    group.tickets = tickets;
                }
            } catch (e) {
                // TODO - what do we do with errors?
                group.members_count = 0;
            }
        }
    }

    /**
     * For displaying entered count (for former event)
     * @returns {Promise<void>}
     */
    async getGroupsFormerEventTickets() {
        for (const group of this.groups) {
            try {
                const tickets = await this.groupService.getCampsMembersTickets(group.id, this.eventsService.getFormerEventId());
                if (!tickets || !tickets.length) {
                    group.former_tickets = [];
                } else {
                    group.former_tickets = tickets;
                }
            } catch (e) {
                // TODO - what do we do with errors?
                group.members_count = 0;
            }
        }
    }

    async getGroupsAllocations() {
        try {
            this.allocations = (await this.allocationsService.getGroupsAllocations([this.groups.map(g => g.id)])) || [];
        } catch (e) {
            console.warn(e);
        }
    }

    saveChanges = async () => {
        try {
            const groupsToUpdate = Object.entries(this.changes).map(([id, group]) => {
                return {
                    id,
                    pre_sale_tickets_quota: group.pre_sale_tickets_quota
                }
            });
            if (!groupsToUpdate || !groupsToUpdate.length) {
                return;
            }
            await this.groupService.updatePresaleQuota(groupsToUpdate);
            this.changes = {};
            await this.auditService.setAudit(constants.AUDIT_TYPES.PRESALE_ALLOCATIONS_ADMIN);
            await this.getAudits();
        } catch (e) {
            console.warn(`Error saving presale quota! - ${e.stack}`);
        }
    };

    saveButton = {
        icon: 'save',
        onClick: this.saveChanges.bind(this),
        tooltip: this.props.t('saveChanges')
    };

    get TRANSLATE_PREFIX() {
        const {match} = this.props;
        return `${match.params.groupType}:management`;
    }

    presaleQuotaChanged = (group) => {
        this.changes[group.id] = group;
    };

    render() {
        const {t, lng} = this.props;
        return (
            <div className="DGSAdmin">
                <Row>
                    <Col md="12">
                        <h1 className="h1-responsive">{t(`${this.TRANSLATE_PREFIX}.allocations.header`)}</h1>
                        <div className={`ButtonGroup ${lng === 'he' ? 'left' : 'right'}`}>
                            <ButtonGroup buttons={[this.saveButton]} vertical={true}/>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                        <p className="p-1">{t(`${this.TRANSLATE_PREFIX}.allocations.description`)} ({this.eventsService.getFormerEventId()})</p>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                        <span>{t(`lastUpdate`)}: </span><Moment className="pl-2 pr-2" format={'DD/MM/YYYY, HH:mm:ss'}>{this.lastAudit}</Moment>
                        <span className="pl-2 pr-2">{t('by')}: </span><span>{this.auditedUser.name}</span>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                        <GroupsTable allocations={this.allocations}
                            presale={true} groups={this.groups}
                                     presaleQuotaChanged={this.presaleQuotaChanged}/>
                    </Col>
                </Row>
            </div>
        );
    }
}

export const PresaleAdmin = withRouter(withI18n()(BasePresaleAdmin));