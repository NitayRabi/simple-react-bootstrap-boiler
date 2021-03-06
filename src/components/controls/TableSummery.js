import React from 'react';
import { Card, CardBody, Container } from 'mdbreact';
import './TableSummery.scss';
import { ExportCSV } from './ExportCSV';
import { PermissableComponent } from './PermissableComponent';

/**
 * @param sums { [title]: sum }
 * @param dataForExport - table data to be exported to CSV
 * @constructor
 */
export const TableSummery = ({sums, csvData, csvName}) => {
    return (
        <Container fluid className="TableSummeryContainer  d-flex justify-content-center">
            <Card className="TableSummery d-flex">
                <CardBody className="SummeryContent d-flex justify-content-even font-small align-items-center">
                    {Object.keys(sums || {}).map(key => {
                        return (
                            <span key={key}>
                                <span className="pr-1 pl-1">{key}:</span>
                                <span className="pr-1 pl-1">{sums[key]}</span>
                            </span>
                        );
                    })}
                    <div>
                        <PermissableComponent permitted={!!csvData}>
                            <ExportCSV
                                data={csvData}
                                filename={csvName}
                            ></ExportCSV>
                        </PermissableComponent>
                    </div>
                </CardBody>
            </Card>
        </Container>
    );
};
