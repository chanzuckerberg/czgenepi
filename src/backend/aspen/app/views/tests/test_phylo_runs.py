import json

from aspen.database.models import CanSee, DataType
from aspen.test_infra.models.sample import sample_factory
from aspen.test_infra.models.sequences import uploaded_pathogen_genome_factory
from aspen.test_infra.models.usergroup import group_factory, user_factory
from aspen.test_infra.models.workflow import aligned_gisaid_dump_factory


def test_create_phylo_run(
    session,
    app,
    client,
):
    """
    Test a regular phylo tree creation.
    """
    group = group_factory()
    user = user_factory(group)
    sample = sample_factory(group, user)
    gisaid_dump = aligned_gisaid_dump_factory()
    uploaded_pathogen_genome_factory(sample, sequence="ATGCAAAAAA")
    session.add(group)
    session.add(gisaid_dump)
    session.commit()

    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    data = {
        "name": "test phylorun",
        "tree_type": "contextual",
        "samples": [sample.public_identifier],
    }
    res = client.post("/api/phylo_runs", json=data)
    assert res.status == "200 OK"
    response = res.json
    template_args = json.loads(response["template_args"])
    assert template_args["run_name"] == data["name"]
    assert template_args["division"] == group.division
    assert template_args["location"] == group.location
    assert "contextual.yaml" in response["template_file_path"]
    assert response["workflow_status"] == "STARTED"
    assert response["group"]["name"] == group.name
    assert "id" in response
