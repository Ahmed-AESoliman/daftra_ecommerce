import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

import { Fragment } from 'react';
import { Link } from 'react-router-dom';

export function Breadcrumbs({ breadcrumbs }: { breadcrumbs: BreadcrumbItemType[] }) {
    const { breadcrumb } = useBreadcrumb();

    return (
        <>
            {breadcrumbs.length > 0 && (
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((item, index) => {
                            const isLast = index === breadcrumbs.length - 1;
                            return (
                                <Fragment key={index}>
                                    <BreadcrumbItem>
                                        {isLast || !item.href ? (
                                            <BreadcrumbPage>{item.title === 'dynamic' ? breadcrumb.title : item.title}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild>
                                                <Link to={item.title === 'dynamic' && breadcrumb.href ? breadcrumb.href : item.href}>
                                                    {item.title === 'dynamic' ? breadcrumb.title : item.title}
                                                </Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && <BreadcrumbSeparator />}
                                </Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            )}
        </>
    );
}
