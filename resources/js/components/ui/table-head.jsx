const TableHead = ({tableHeader}) =>{
    return(<thead className="text-xs uppercase">
        <tr>
            {tableHeader.map((item) => (
                <th key={item.key} className="px-6 py-3 text-nowrap">
                    {item.label}
                </th>
            ))}
        </tr>
    </thead>)
}

export default TableHead
