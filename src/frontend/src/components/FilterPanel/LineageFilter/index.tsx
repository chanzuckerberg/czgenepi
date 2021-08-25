import { MenuSelect } from "czifui";
import React from "react";

const LineageSelect = () => {
  return (
    <>
      <div className={classes.root}>
        <ButtonBase
          disableRipple
          className={classes.button}
          aria-describedby={id}
          onClick={handleClick}
        >
          <span>Click Target</span>
          <ExpandMoreIcon />
        </ButtonBase>

        <Chips value={value} multiple={multiple} onDelete={handleDelete} />
      </div>
      <Popper
        id={id}
        open={open}
        anchorEl={anchorEl}
        className={classes.popper}
      >
        <MenuSelect
          open
          search={search}
          onClose={handleClose}
          multiple={multiple}
          classes={{
            paper: classes.paper,
            popperDisablePortal: classes.popperDisablePortal,
          }}
          value={multiple ? pendingValue : value}
          onChange={handleChange}
          disableCloseOnSelect={multiple}
          options={options}
          {...props}
        />
      </Popper>
    </>
  );
};

export { LineageSelect };
