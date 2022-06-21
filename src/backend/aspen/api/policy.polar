allow(actor, action, resource) if
  has_permission(actor, action, resource);

actor AuthContext { }

resource Group {
  roles = ["admin", "viewer", "member"];
}

resource Sample {
  roles = ["admin", "viewer", "member"];
  permissions = [ "read", "write" ];
  relations = { owner: Group };

  "viewer" if "viewer" on "owner";
  "member" if "member" on "owner";
  "admin" if "admin" on "owner";

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

  "read" if "viewer";
  "read" if "admin";
  "read" if "member";
  "write" if "member";
  "read_private" if "member";
}

has_role(ac: AuthContext, name: String, group: Group) if
    ( name in ac.user_roles and ac.group == group) or ( 
    grole in ac.group.group_roles and
    grole.role.name = name and
    grole.grantor_group_id = group.id);

has_permission(authcontext: AuthContext, "read", sample: Sample)
  if has_role(authcontext, "member", sample)
    or (has_role(authcontext, "viewer", sample)
        and sample.private = false);

has_relation(group: Group, "owner", sample: Sample) if sample.submitting_group = group;
has_relation(group: Group, "owner", phylo_run: PhyloRun) if phylo_run.group = group;
