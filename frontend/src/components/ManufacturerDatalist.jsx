export default function ManufacturerDatalist({ id, manufacturers }) {
  return (
    <datalist id={id}>
      {manufacturers.map((manufacturer) => (
        <option key={manufacturer} value={manufacturer} />
      ))}
    </datalist>
  );
}
