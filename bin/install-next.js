#!/usr/bin/env node
import { install } from 'install-next';

await install(process.argv.slice(2));
