import json

from flask import Response

from aspen.app.views.api_utils import filter_usergroup_dict
from aspen.app.views.usergroup import GET_GROUP_FIELDS, GET_USER_FIELDS
from aspen.database.models.usergroup import User
from aspen.test_infra.models.usergroup import group_factory, user_factory


def test_usergroup_view_get(session, app, client):
    group = group_factory()
    user = user_factory(group)
    session.add(group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    res = client.get("/api/usergroup")
    expected = {
        "user": filter_usergroup_dict(user.to_dict(), GET_USER_FIELDS),
        "group": filter_usergroup_dict(user.group.to_dict(), GET_GROUP_FIELDS),
    }
    assert expected == json.loads(res.get_data(as_text=True))


def test_usergroup_view_put_pass(session, app, client):
    group = group_factory()
    user = user_factory(group, agreed_to_tos=False)
    session.add(group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = {"agreed_to_tos": True}
    res = client.put("/api/usergroup", json=data, content_type="application/json")

    # start a new transaction
    session.close()
    session.begin()
    updated_user = (
        session.query(User).filter(User.auth0_user_id == user.auth0_user_id).one()
    )
    assert updated_user.agreed_to_tos
    assert res.status == "200 OK"


def test_usergroup_view_put_fail(session, app, client):
    group = group_factory()
    user = user_factory(group, agreed_to_tos=False)
    session.add(group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = {"fake_field": "even faker"}
    res = client.put("/api/usergroup", json=data, content_type="application/json")

    assert res.status == "400 BAD REQUEST"


def test_usergroup_view_post_pass_w_auth0_user_id(session, app, client):
    group = group_factory()
    new_user_group = group_factory(name="new_group")
    user = user_factory(group, system_admin=True)
    session.add(group)
    session.add(new_user_group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = {
        "name": "new_user",
        "email": "new_user@hotmail.com",
        "auth0_user_id": "test_auth0_id_new",
        "group_admin": False,
        "system_admin": False,
        "group_id": new_user_group.id,
    }
    res = client.post("/api/usergroup", json=data, content_type="application/json")

    assert res.status == "200 OK"
    session.close()
    session.begin()
    new_user = session.query(User).filter(User.name == data["name"]).one_or_none()
    assert new_user is not None


def test_usergroup_view_post_pass_no_auth0_user_id(mocker, session, app, client):
    group = group_factory()
    new_user_group = group_factory(name="new_group")
    user = user_factory(group, system_admin=True)
    session.add(group)
    session.add(new_user_group)
    session.commit()

    mocker.patch(
        "aspen.app.views.usergroup.create_auth0_entry",
        return_value={"user_id": "new_auth0_entry"},
    )

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = {
        "name": "new_user",
        "email": "new_user@hotmail.com",
        "group_admin": False,
        "system_admin": False,
        "group_id": new_user_group.id,
    }
    res = client.post("/api/usergroup", json=data, content_type="application/json")

    assert res.status == "200 OK"
    session.close()
    session.begin()
    new_user = session.query(User).filter(User.name == data["name"]).one_or_none()
    assert new_user is not None


def test_usergroup_view_post_fail_no_auth0_user_id(mocker, session, app, client):
    group = group_factory()
    new_user_group = group_factory(name="new_group")
    user = user_factory(group, system_admin=True)
    session.add(group)
    session.add(new_user_group)
    session.commit()

    mocker.patch(
        "aspen.app.views.usergroup.create_auth0_entry",
        return_value=Response("Auth0Error", 400),
    )

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = {
        "name": "new_user",
        "email": "new_user@hotmail.com",
        "group_admin": False,
        "system_admin": False,
        "group_id": new_user_group.id,
    }
    res = client.post("/api/usergroup", json=data, content_type="application/json")

    assert res.status == "400 BAD REQUEST"
    assert res.get_data() == b"Auth0Error"


def test_usergroup_view_post_fail_not_system_admin(session, app, client):
    group = group_factory()
    new_user_group = group_factory(name="new_group")
    user = user_factory(group, system_admin=False)
    session.add(group)
    session.add(new_user_group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = {
        "name": "new_user",
        "email": "new_user@hotmail.com",
        "auth0_user_id": "test_auth0_id_new",
        "group_admin": False,
        "system_admin": False,
        "group_id": new_user_group.id,
    }
    res = client.post("/api/usergroup", json=data, content_type="application/json")

    assert res.status == "400 BAD REQUEST"
    assert (
        res.get_data()
        == b'{"error":"Insufficient permissions to create new user, only system admins are able to create new users"}\n'
    )


def test_usergroup_view_post_fail_insufficient_info(session, app, client):
    group = group_factory()
    new_user_group = group_factory(name="new_group")
    user = user_factory(group, system_admin=True)
    session.add(group)
    session.add(new_user_group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}

    data = {
        "name": "new_user",
        "auth0_user_id": "test_auth0_id_new",
        "system_admin": False,
        "group_id": new_user_group.id,
    }
    res = client.post("/api/usergroup", json=data, content_type="application/json")

    assert res.status == "400 BAD REQUEST"
    assert (
        res.get_data()
        == b'{"error":"Insufficient information required to create new user, [\'email\', \'group_admin\'] are required"}\n'
    )


def test_redirect(app, client):
    res = client.get("api/usergroup")
    assert res.status == "302 FOUND"
    redirect_text = b'You should be redirected automatically to target URL: <a href="/login">/login</a>'
    assert redirect_text in res.data
