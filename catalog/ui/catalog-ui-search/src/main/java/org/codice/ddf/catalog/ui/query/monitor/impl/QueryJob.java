/**
 * Copyright (c) Codice Foundation
 * <p/>
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 * <p/>
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 */
package org.codice.ddf.catalog.ui.query.monitor.impl;

import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

/**
 * Quartz Job that calls {@link WorkspaceQueryService#run()}.
 */
public class QueryJob implements Job {

    private static final Lock lock = new ReentrantLock();

    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        lock.lock();
        try {
            WorkspaceQueryService.getInstance()
                    .run();
        } finally {
            lock.unlock();
        }
    }

    @Override
    public String toString() {
        return "QueryJob{}";
    }
}
