from marshmallow import fields, Schema, validate

# What kinds of ondemand nextstrain builds do we support?
PHYLO_TREE_TYPES = {
    "local": "local.yaml",
    "contextual": "contextual.yaml",
}


class PhyloRunRequestSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=128))
    samples = fields.List(fields.String(), required=True)
    tree_type = fields.String(
        required=True, validate=validate.OneOf(PHYLO_TREE_TYPES.keys())
    )


class GroupResponseSchema(Schema):
    id = fields.Int()
    name = fields.String()
    address = fields.String()
    prefix = fields.String()
    division = fields.String()
    location = fields.String()


class WorkflowStatusSchema(Schema):
    name = fields.String()


class PhyloRunResponseSchema(Schema):
    id = fields.Int()
    start_datetime = fields.DateTime()
    end_datetime = fields.DateTime()
    workflow_status = fields.Pluck(WorkflowStatusSchema, "name")
    group = fields.Nested(GroupResponseSchema, only=("id", "name"))
    template_file_path = fields.String()
    template_args = fields.Nested(GroupResponseSchema, only=("division", "location"))
