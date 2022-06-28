allow(actor, action, resource) if
  has_permission(actor, action, resource);

actor AuthContext { }

resource Group {
  roles = ["admin", "viewer", "member"];
}

resource Sample {
  roles = ["admin", "viewer", "member"];
  permissions = [ "read", "write" ];
#  relations = { owner: Group };

#  "member" if "member" on "owner";
#  "admin" if "admin" on "owner";

  "read" if "viewer";
  "read" if "admin";
  "read" if "member";
  "write" if "member";
}

resource PhyloRun {
  roles = ["admin", "viewer", "member"];
  permissions = ["read", "write", "read_private"];
  relations = { owner: Group };

  "viewer" if "viewer" on "owner";
  "member" if "member" on "owner";
  "admin" if "admin" on "owner";

  "read" if "admin";
  "read" if "member";
  "write" if "member";
  "read_private" if "member";
}

has_role(ac: AuthContext, name: String, group: Group) if
    grole in ac.group_roles and
    grole.role = name and
    grole.group_id = group.id;

has_role(ac: AuthContext, name: String, sample: Sample) if
    (name in ac.user_roles and
    sample.submitting_group_id = ac.group.id) or (
        grole in ac.group_roles and
        grole.role = name and
        grole.group_id = sample.submitting_group_id and
        sample.private = false
    );

has_relation(group: Group, "owner", phylo_run: PhyloRun) if phylo_run.group = group;
