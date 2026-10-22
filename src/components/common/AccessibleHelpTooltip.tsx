import React from 'react';
import { ContextHelpButton } from '../help/ContextualHelp';

/** Existing field-help call sites now open the shared contextual detail drawer. */
interface AccessibleHelpTooltipProps { content:string; label?:string; }
export const AccessibleHelpTooltip:React.FC<AccessibleHelpTooltipProps>=({content,label='Help information'})=>
  <ContextHelpButton topic={label} hint={content}/>;
