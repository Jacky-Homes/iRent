import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Input, Button, Form, Label } from 'reactstrap';
import { FormGroup } from '@material-ui/core';
import { useHistory } from "react-router-dom";
import { NotificationManager } from 'react-notifications';

import Main from '../../Main';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../../Util/LinearProgress';
import * as Util from '../../Util/util';
import * as tenantsAPI from '../../../Api/tenants';
import * as homeAPI from '../../../Api/home';
import * as Constants from '../../Util/constants';

const EditNote = (props) => {
    const history = useHistory();
    const uID = props.location.state ? props.location.state.unitID : null;

    const [ loading, setLoading ] = useState(false);
    const [ unit, setUnit ] = useState({});

    const { handleSubmit, control, setValue, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(uID === null) {
                history.goBack();
                return;
            }
            const tenant = await tenantsAPI.getByUnit(parseInt(uID));
            const unit = await tenantsAPI.getTenantUnit(parseInt(tenant.TenantID));
            setUnit(unit);
            setValue("comment", unit.Comment);
            setLoading(false);
        }
        fetchData();
    }, [uID, history, setValue])

    const submitForm = async (data) => {
        setLoading(true);
        const res = await homeAPI.updateNote({
            comment: data.comment,
            unitID: uID
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        } 
        NotificationManager.success("Comment updated.", "Success");
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Edit Unit Note..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    const title = `Unit: ${unit.UnitName}`
    return (
        <Main>
            <div className="formelements-wrapper" style={{marginTop: '2%'}}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => history.goBack()}></i>
                        <h2>
                            <span>Edit Unit Note</span>
                        </h2>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-6 col-md-6 col-xl-6" style={{marginLeft: '1%'}}>
                    <RctCollapsibleCard heading={title}>
                        <Form onSubmit={handleSubmit(submitForm)}>
                            <div className="col-sm-12">
                                <FormGroup className="mr-10 mb-10">
                                    <Label for="comment" className="mr-sm-10">Comment</Label>
                                    <Controller
                                        name="comment"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="textarea" rows={4} id="comment" className="form-control" 
                                                style={Util.setErrorStyle(errors.comment)} /> 
                                        )}
                                    />
                                    {errors.comment && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </FormGroup>
                            </div>
                            <Button type="submit" color="primary" size="sm" className="w-auto">Update</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
        </Main>
    )
}

export default EditNote;