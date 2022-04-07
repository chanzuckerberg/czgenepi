allow(actor, action, resource) if
  has_permission(actor, action, resource);

actor User {
}

resource Group {
  roles = ["owner", "member"];
}

has_role(user: User, name: String, group: Group) if
    role in user.group_roles and
    role.role.name = name and
    role.group_id = group.id;

resource Sample {
  roles = ["reader", "writer"];
  permissions = [
    "read",
    "write",
  ];
  relations = { parent: Group };

  "read" if "reader";
  "write" if "writer";

  "writer" if "owner" on "parent";
  "reader" if "member" on "parent";
}
has_relation(group: Group, "parent", sample: Sample) if sample.submitting_group = group;

resource PhyloRun {
  roles = ["member", "owner"];
  permissions = [
    "read",
    "write",
  ];
  relations = { parent: Group };

  "read" if "member";
  "write" if "owner";

  "owner" if "owner" on "parent";
  "member" if "owner" on "parent";
  "member" if "member" on "parent";
}

has_relation(group: Group, "parent", phylo_run: PhyloRun) if phylo_run.group = group;

resource PhyloTree {
  roles = ["member", "owner"];
  permissions = [
    "read",
    "write",
  ];

  "read" if "member";
  "read" if "owner";
  "write" if "owner";
}


has_role(user: User, name: String, phylo_tree: PhyloTree) if
    role in user.group_roles and
    role.group_id = phylo_tree.phylo_run.group_id and
    role.role.name = name;
