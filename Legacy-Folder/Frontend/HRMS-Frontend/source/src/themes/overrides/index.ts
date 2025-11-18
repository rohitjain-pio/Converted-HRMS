/* eslint-disable @typescript-eslint/no-explicit-any */

import { merge } from 'lodash';

// project import
import Badge from '@/themes/overrides/Badge';
import Button from '@/themes/overrides/Button';
import CardContent from '@/themes/overrides/CardContent';
import Checkbox from '@/themes/overrides/Checkbox';
import Chip from '@/themes/overrides/Chip';
import IconButton from '@/themes/overrides/IconButton';
import InputLabel from '@/themes/overrides/InputLabel';
import LinearProgress from '@/themes/overrides/LinearProgress';
import Link from '@/themes/overrides/Link';
import ListItemIcon from '@/themes/overrides/ListItemIcon';
import OutlinedInput from '@/themes/overrides/OutlinedInput';
import Tab from '@/themes/overrides/Tab';
import TableCell from '@/themes/overrides/TableCell';
import Tabs from '@/themes/overrides/Tabs';
import Typography from '@/themes/overrides/Typography';

// ==============================|| OVERRIDES - MAIN ||============================== //

export default function ComponentsOverrides(theme: any) {
  return merge(
    Button(theme),
    Badge(theme),
    CardContent(),
    Checkbox(theme),
    Chip(theme),
    IconButton(theme),
    InputLabel(theme),
    LinearProgress(),
    Link(),
    ListItemIcon(),
    OutlinedInput(theme),
    Tab(theme),
    TableCell(theme),
    Tabs(),
    Typography()
  );
}
