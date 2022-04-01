allow(actor, action, resource) if
  has_permission(actor, action, resource);

# Users can see each other.
has_permission(_: User, "read", _: User);

# A User can read their own profile.
has_permission(_: User{id: id}, "read_profile", _:User{id: id});

# Any logged-in user can create a new group.
has_permission(_: User, "create", _: Group);

actor User {
  permissions = ["read"];
}

resource Group {
  roles = ["owner", "member"];
  permissions = [
    "read",
    "create_trees",
    "list_trees",
    "create_samples",
    "list_samples",
    "create_role_assignments",
    "list_role_assignments",
    "update_role_assignments",
    "delete_role_assignments",
  ];

  "read" if "member";
  "list_trees" if "member";
  "list_samples" if "member";
  "list_role_assignments" if "member";

  "create_trees" if "owner";
  "create_samples" if "owner";
  "create_role_assignments" if "owner";
  "update_role_assignments" if "owner";
  "delete_role_assignments" if "owner";

  "member" if "owner";
}

has_role(user: User, name: String, group: Group) if
    group_role in user.group_roles and
    group_role matches { name: name, group_id: group.id };

resource PhyloRun {
  roles = ["admin", "maintainer", "reader"];
  permissions = [
    "read",
    "create_issues",
    "list_issues",
    "create_role_assignments",
    "list_role_assignments",
    "update_role_assignments",
    "delete_role_assignments",
  ];
  relations = { parent: Group };

  "create_role_assignments" if "admin";
  "list_role_assignments" if "admin";
  "update_role_assignments" if "admin";
  "delete_role_assignments" if "admin";

  "read" if "reader";
  "list_issues" if "reader";
  "create_issues" if "reader";

  "admin" if "owner" on "parent";
  "reader" if "member" on "parent";

  "maintainer" if "admin";
  "reader" if "maintainer";
}

resource Sample {
  roles = ["admin", "maintainer", "reader"];
  permissions = [
    "read",
    "create_issues",
    "list_issues",
    "create_role_assignments",
    "list_role_assignments",
    "update_role_assignments",
    "delete_role_assignments",
  ];
  relations = { parent: Group };

  "create_role_assignments" if "admin";
  "list_role_assignments" if "admin";
  "update_role_assignments" if "admin";
  "delete_role_assignments" if "admin";

  "read" if "reader";
  "list_issues" if "reader";
  "create_issues" if "reader";

  "admin" if "owner" on "parent";
  "reader" if "member" on "parent";

  "maintainer" if "admin";
  "reader" if "maintainer";
}

has_relation(group: Group, "parent", sample: Sample) if sample.submitting_group = group;
has_relation(group: Group, "parent", phylo_run: PhyloRun) if phylo_run.group = group;

resource PhyloTree {
  roles = ["creator"];
  permissions = ["read", "close"];
  relations = { parent: PhyloRun };
  "read" if "reader" on "parent";
  "close" if "maintainer" on "parent";
  "close" if "creator";
}

has_relation(phylo_run: PhyloRun, "parent", phylo_tree: PhyloTree) if phylo_tree.producing_workflow = phylo_run;

# resource Role {
#   permissions = ["read"];
#   relations = { group: Group };
#   "read" if "list_role_assignments" on "group";
# }

resource GroupRole {
  permissions = ["read"];
  relations = { group: Group };
  "read" if "list_role_assignments" on "group";
}

has_relation(group: Group, "group", role: GroupRole) if group = role.group;
